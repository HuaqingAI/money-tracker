import {
  BILLING_IMPORT_ERROR_CODES,
  BILLING_TRANSACTION_SOURCES,
  BILLING_TRANSACTION_STATUS,
  type BillingCsvEncoding,
  type BillingCsvParseRule,
  billingCsvParseRuleSchema,
  type BillingCsvPlatform,
  type BillingNormalizedTransaction,
} from '@money-tracker/shared';

import { BillingImportError } from './errors';

export interface ParseBillingCsvInput {
  bytes: Uint8Array;
  rules: BillingCsvParseRule[];
}

export interface ParseBillingCsvResult {
  failedCount: number;
  platform: BillingCsvPlatform;
  rule: BillingCsvParseRule;
  totalCount: number;
  transactions: BillingNormalizedTransaction[];
}

interface ParsedCsvText {
  rule: BillingCsvParseRule;
  text: string;
}

const ENCODING_FALLBACKS: BillingCsvEncoding[] = ['utf-8', 'gb18030', 'gbk'];

function normalizeHeader(value: string): string {
  return value.replace(/^\uFEFF/, '').trim();
}

function uniqueEncodings(primary: BillingCsvEncoding): BillingCsvEncoding[] {
  return [primary, ...ENCODING_FALLBACKS].filter(
    (encoding, index, all) => all.indexOf(encoding) === index,
  );
}

function decodeBytes(bytes: Uint8Array, encoding: BillingCsvEncoding): string {
  return new TextDecoder(encoding, {
    fatal: true,
    ignoreBOM: true,
  }).decode(bytes);
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        index += 1;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  row.push(field);
  rows.push(row);

  return rows.filter((candidate) =>
    candidate.some((value) => value.trim().length > 0),
  );
}

function getHeaderForRule(
  rows: string[][],
  rule: BillingCsvParseRule,
): string[] | null {
  const header = rows[rule.skipRows];
  if (!header) {
    return null;
  }

  const normalizedHeader = header.map(normalizeHeader);
  const hasRequiredHeaders = rule.headerMatch.every((expected) =>
    normalizedHeader.includes(expected),
  );

  return hasRequiredHeaders ? normalizedHeader : null;
}

function findMatchingCsvText(
  bytes: Uint8Array,
  rules: BillingCsvParseRule[],
): ParsedCsvText {
  let hadEncodingFailure = false;
  let hadPrimaryDecodedCandidate = false;
  let hadFallbackDecodedCandidate = false;

  for (const rule of rules) {
    const parsedRule = billingCsvParseRuleSchema.safeParse(rule);
    if (!parsedRule.success) {
      throw new BillingImportError(
        BILLING_IMPORT_ERROR_CODES.invalidCsvRule,
        parsedRule.error.issues[0]?.message ?? 'CSV 解析规则无效',
        500,
      );
    }

    for (const encoding of uniqueEncodings(parsedRule.data.encoding)) {
      const isPrimaryEncoding = encoding === parsedRule.data.encoding;
      let text: string;
      try {
        text = decodeBytes(bytes, encoding);
      } catch {
        hadEncodingFailure = true;
        continue;
      }

      if (isPrimaryEncoding) {
        hadPrimaryDecodedCandidate = true;
      } else {
        hadFallbackDecodedCandidate = true;
      }

      const rows = parseCsvRows(text);
      const header = getHeaderForRule(rows, parsedRule.data);
      if (header) {
        return {
          rule: parsedRule.data,
          text,
        };
      }
    }
  }

  if (
    hadEncodingFailure &&
    (!hadPrimaryDecodedCandidate || hadFallbackDecodedCandidate)
  ) {
    throw new BillingImportError(
      BILLING_IMPORT_ERROR_CODES.importEncodingError,
      '无法识别账单文件编码，请确认导出的是支付宝或微信 CSV 原始文件',
      400,
    );
  }

  throw new BillingImportError(
    BILLING_IMPORT_ERROR_CODES.invalidCsvFile,
    '未识别到支付宝或微信账单表头，请检查 CSV 文件格式',
    400,
  );
}

function getColumnIndex(
  headers: string[],
  columnName: string | undefined,
): number | null {
  if (!columnName) {
    return null;
  }

  const index = headers.indexOf(columnName);
  return index >= 0 ? index : null;
}

function readCell(row: string[], index: number | null): string {
  if (index === null) {
    return '';
  }

  return row[index]?.trim() ?? '';
}

function parseAmountCents(value: string, direction: string): number {
  const trimmed = value.trim();
  const negativeFromValue =
    trimmed.startsWith('-') || (trimmed.startsWith('(') && trimmed.endsWith(')'));
  const numeric = trimmed
    .replace(/[,，\s￥¥元]/g, '')
    .replace(/[()]/g, '')
    .replace(/[^\d.+-]/g, '');
  const match = numeric.match(/^-?\d+(?:\.\d{1,2})?$/);

  if (!match) {
    throw new Error('金额格式无效');
  }

  const absoluteNumeric = numeric.replace(/^-/, '');
  const [yuanPart = '0', centPart = ''] = absoluteNumeric.split('.');
  const yuanCents = Number.parseInt(yuanPart, 10) * 100;
  const cents = Number.parseInt(centPart.padEnd(2, '0').slice(0, 2) || '0', 10);
  const absoluteCents = yuanCents + cents;

  if (!Number.isSafeInteger(absoluteCents)) {
    throw new Error('金额超出安全范围');
  }

  if (direction.includes('支出')) {
    return -Math.abs(absoluteCents);
  }
  if (direction.includes('收入')) {
    return Math.abs(absoluteCents);
  }

  return negativeFromValue || numeric.startsWith('-')
    ? -absoluteCents
    : absoluteCents;
}

function parseChinaLocalDateToUtcIso(value: string): string {
  const match = value
    .trim()
    .match(
      /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/,
    );

  if (!match) {
    throw new Error('交易时间格式无效');
  }

  const [, yearRaw, monthRaw, dayRaw, hourRaw, minuteRaw, secondRaw = '0'] = match;
  if (!yearRaw || !monthRaw || !dayRaw || !hourRaw || !minuteRaw) {
    throw new Error('交易时间格式无效');
  }

  const year = Number.parseInt(yearRaw, 10);
  const month = Number.parseInt(monthRaw, 10);
  const day = Number.parseInt(dayRaw, 10);
  const hour = Number.parseInt(hourRaw, 10);
  const minute = Number.parseInt(minuteRaw, 10);
  const second = Number.parseInt(secondRaw, 10);

  const localDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  if (
    localDate.getUTCFullYear() !== year ||
    localDate.getUTCMonth() !== month - 1 ||
    localDate.getUTCDate() !== day ||
    localDate.getUTCHours() !== hour ||
    localDate.getUTCMinutes() !== minute ||
    localDate.getUTCSeconds() !== second
  ) {
    throw new Error('交易时间格式无效');
  }

  const timestamp = Date.UTC(year, month - 1, day, hour - 8, minute, second);
  const date = new Date(timestamp);

  return date.toISOString();
}

function getSource(platform: BillingCsvPlatform) {
  return platform === 'alipay'
    ? BILLING_TRANSACTION_SOURCES.alipayCsv
    : BILLING_TRANSACTION_SOURCES.wechatCsv;
}

function normalizeNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseBillingCsv(
  input: ParseBillingCsvInput,
): ParseBillingCsvResult {
  if (input.rules.length === 0) {
    throw new BillingImportError(
      BILLING_IMPORT_ERROR_CODES.invalidCsvRule,
      '没有可用的 CSV 解析规则',
      500,
    );
  }

  const { rule, text } = findMatchingCsvText(input.bytes, input.rules);
  const rows = parseCsvRows(text);
  const headers = getHeaderForRule(rows, rule);

  if (!headers) {
    throw new BillingImportError(
      BILLING_IMPORT_ERROR_CODES.invalidCsvFile,
      'CSV 表头与解析规则不匹配',
      400,
    );
  }

  const mapping = rule.columnMapping;
  const amountIndex = getColumnIndex(headers, mapping.amount);
  const transactionAtIndex = getColumnIndex(headers, mapping.transactionAt);
  const merchantIndex = getColumnIndex(headers, mapping.merchant);
  const descriptionIndex = getColumnIndex(headers, mapping.description);
  const directionIndex = getColumnIndex(headers, mapping.direction);

  if (amountIndex === null || transactionAtIndex === null) {
    throw new BillingImportError(
      BILLING_IMPORT_ERROR_CODES.invalidCsvRule,
      'CSV 解析规则缺少金额或交易时间列映射',
      500,
    );
  }

  const dataRows = rows.slice(rule.skipRows + 1);
  const transactions: BillingNormalizedTransaction[] = [];
  let failedCount = 0;

  for (const row of dataRows) {
    try {
      const amount = readCell(row, amountIndex);
      const transactionAt = readCell(row, transactionAtIndex);
      const direction = readCell(row, directionIndex);
      transactions.push({
        amount_cents: parseAmountCents(amount, direction),
        transaction_at: parseChinaLocalDateToUtcIso(transactionAt),
        merchant: normalizeNullable(readCell(row, merchantIndex)),
        description: normalizeNullable(readCell(row, descriptionIndex)),
        source: getSource(rule.platform),
        status: BILLING_TRANSACTION_STATUS.pendingConfirmation,
      });
    } catch {
      failedCount += 1;
    }
  }

  return {
    failedCount,
    platform: rule.platform,
    rule,
    totalCount: dataRows.length,
    transactions,
  };
}
