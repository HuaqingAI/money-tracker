import {
  BILLING_DIRECTION_CONFIDENCE,
  BILLING_IMPORT_ERROR_CODES,
  BILLING_TRANSACTION_DIRECTIONS,
  BILLING_TRANSACTION_SOURCES,
  BILLING_TRANSACTION_STATUS,
  type BillingCsvEncoding,
  type BillingCsvParseRule,
  billingCsvParseRuleSchema,
  type BillingCsvPlatform,
  type BillingDirectionConfidence,
  type BillingNormalizedTransaction,
  type BillingTransactionDirection,
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
  header: MatchedCsvHeader;
  rule: BillingCsvParseRule;
  rows: string[][];
}

interface MatchedCsvHeader {
  headers: string[];
  index: number;
}

interface HeaderColumnMatch {
  index: number;
  strength: number;
}

const ENCODING_FALLBACKS: BillingCsvEncoding[] = ['utf-8', 'gb18030', 'gbk'];
const SUCCESS_STATUS_KEYWORDS = ['支付成功', '交易成功', '已入账', '已收钱', '收款成功'];
const REFUND_STATUS_KEYWORDS = ['退款成功', '退还成功', '已退款', '已退还'];
const REFUND_DIRECTION_KEYWORDS = ['退款', '退还', '退回'];
const CLOSED_DIRECTION_KEYWORDS = ['关闭', '结清', '冲销'];
const INCOME_DIRECTION_KEYWORDS = ['收入', '收款'];
const INCOME_STATUS_KEYWORDS = ['已收钱', '收款成功'];
const EXPENSE_DIRECTION_KEYWORDS = ['支出', '付款'];
const NON_IMPORTABLE_STATUS_KEYWORDS = [
  '关闭',
  '失败',
  '撤销',
  '取消',
  '处理中',
  '待支付',
];
const HEADER_ALIASES: Readonly<Record<string, readonly string[]>> = {
  '交易时间': ['交易创建时间', '时间', '日期'],
  交易金额: ['金额'],
  金额: ['交易金额'],
  '金额(元)': ['金额（元）', '金额', '交易金额'],
  交易号: ['交易订单号', '交易单号', '商家订单号', '商户订单号'],
  交易单号: ['交易号', '交易订单号', '商家订单号', '商户订单号'],
  交易对方: ['对方', '商户', '商家', '商户名称'],
  商品说明: ['商品', '商品名称', '交易说明'],
  商品: ['商品说明', '商品名称', '交易说明'],
  交易状态: ['当前状态', '状态'],
  当前状态: ['交易状态', '状态'],
  '收/支': ['收支', '收/付款', '收付款'],
};

function normalizeHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, '')
    .replace(/[（]/g, '(')
    .replace(/[）]/g, ')')
    .trim();
}

function uniqueValues(values: string[]): string[] {
  return values.filter((value, index, all) => all.indexOf(value) === index);
}

function getHeaderCandidates(value: string): string[] {
  const normalized = normalizeHeader(value);
  const aliases = HEADER_ALIASES[normalized] ?? [];
  return uniqueValues([normalized, ...aliases.map(normalizeHeader)]);
}

function matchHeaderColumn(
  headers: string[],
  columnName: string | undefined,
): HeaderColumnMatch | null {
  if (!columnName) {
    return null;
  }

  const candidates = getHeaderCandidates(columnName);
  for (let candidateIndex = 0; candidateIndex < candidates.length; candidateIndex += 1) {
    const index = headers.indexOf(candidates[candidateIndex] ?? '');
    if (index >= 0) {
      return {
        index,
        strength: candidateIndex === 0 ? 2 : 1,
      };
    }
  }

  return null;
}

function getRuleColumnNames(rule: BillingCsvParseRule): string[] {
  const mapping = rule.columnMapping;
  return [
    ...rule.headerMatch,
    mapping.amount,
    mapping.transactionAt,
    mapping.externalId,
    mapping.merchant,
    mapping.description,
    mapping.direction,
    mapping.status,
  ].filter(
    (value): value is string =>
      typeof value === 'string' && value.trim().length > 0,
  );
}

function scoreHeaderForRule(
  headers: string[],
  rule: BillingCsvParseRule,
): number {
  return getRuleColumnNames(rule).reduce(
    (score, columnName) =>
      score + (matchHeaderColumn(headers, columnName)?.strength ?? 0),
    0,
  );
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

function matchHeaderRow(
  row: string[] | undefined,
  rule: BillingCsvParseRule,
): string[] | null {
  if (!row) {
    return null;
  }

  const normalizedHeader = row.map(normalizeHeader);
  const hasRequiredHeaders = rule.headerMatch.every((expected) =>
    matchHeaderColumn(normalizedHeader, expected) !== null,
  );

  return hasRequiredHeaders ? normalizedHeader : null;
}

function getHeaderForRule(
  rows: string[][],
  rule: BillingCsvParseRule,
): MatchedCsvHeader | null {
  const preferredStart = Math.min(rule.skipRows, rows.length);

  for (let index = preferredStart; index < rows.length; index += 1) {
    const headers = matchHeaderRow(rows[index], rule);
    if (headers) {
      return { headers, index };
    }
  }

  for (let index = 0; index < preferredStart; index += 1) {
    const headers = matchHeaderRow(rows[index], rule);
    if (headers) {
      return { headers, index };
    }
  }

  return null;
}

function findMatchingCsvText(
  bytes: Uint8Array,
  rules: BillingCsvParseRule[],
): ParsedCsvText {
  let hadEncodingFailure = false;
  let hadPrimaryDecodedCandidate = false;
  let hadFallbackDecodedCandidate = false;
  let bestMatch: (ParsedCsvText & { score: number }) | null = null;

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
        const match = {
          header,
          rule: parsedRule.data,
          rows,
          score: scoreHeaderForRule(header.headers, parsedRule.data),
        };
        if (!bestMatch || match.score > bestMatch.score) {
          bestMatch = match;
        }
      }
    }
  }

  if (bestMatch) {
    return {
      header: bestMatch.header,
      rule: bestMatch.rule,
      rows: bestMatch.rows,
    };
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
  return matchHeaderColumn(headers, columnName)?.index ?? null;
}

function readCell(row: string[], index: number | null): string {
  if (index === null) {
    return '';
  }

  return row[index]?.trim() ?? '';
}

function parseAmountCents(
  value: string,
  direction: BillingTransactionDirection,
): number {
  const trimmed = value.trim();
  if (!/^[\s,，￥¥元()（）+\-\d.]+$/.test(trimmed)) {
    throw new Error('金额格式无效');
  }

  const negativeFromValue =
    trimmed.startsWith('-') ||
    ((trimmed.startsWith('(') && trimmed.endsWith(')')) ||
      (trimmed.startsWith('（') && trimmed.endsWith('）')));
  const numeric = trimmed
    .replace(/[,，\s￥¥元]/g, '')
    .replace(/[()（）]/g, '')
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

  if (direction === BILLING_TRANSACTION_DIRECTIONS.expense) {
    return -Math.abs(absoluteCents);
  }
  if (
    direction === BILLING_TRANSACTION_DIRECTIONS.income ||
    direction === BILLING_TRANSACTION_DIRECTIONS.refund
  ) {
    return Math.abs(absoluteCents);
  }

  return negativeFromValue || numeric.startsWith('-')
    ? -absoluteCents
    : absoluteCents;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tokenPattern(token: string): string {
  switch (token) {
    case 'yyyy':
      return '(?<year>\\d{4})';
    case 'MM':
      return '(?<month>\\d{2})';
    case 'M':
      return '(?<month>\\d{1,2})';
    case 'dd':
      return '(?<day>\\d{2})';
    case 'd':
      return '(?<day>\\d{1,2})';
    case 'HH':
      return '(?<hour>\\d{2})';
    case 'H':
      return '(?<hour>\\d{1,2})';
    case 'mm':
      return '(?<minute>\\d{2})';
    case 'm':
      return '(?<minute>\\d{1,2})';
    case 'ss':
      return '(?<second>\\d{2})';
    case 's':
      return '(?<second>\\d{1,2})';
    default:
      return escapeRegExp(token);
  }
}

function createDateFormatRegex(dateFormat: string): RegExp {
  const tokens = ['yyyy', 'MM', 'dd', 'HH', 'mm', 'ss', 'M', 'd', 'H', 'm', 's'];
  let pattern = '';
  for (let index = 0; index < dateFormat.length;) {
    const token = tokens.find((candidate) =>
      dateFormat.slice(index).startsWith(candidate),
    );
    if (token) {
      pattern += tokenPattern(token);
      index += token.length;
    } else {
      pattern += escapeRegExp(dateFormat[index] ?? '');
      index += 1;
    }
  }
  return new RegExp(`^${pattern}$`);
}

function parseChinaLocalDateToUtcIso(value: string, dateFormat: string): string {
  const match = value.trim().match(createDateFormatRegex(dateFormat));

  if (!match) {
    throw new Error('交易时间格式无效');
  }

  const {
    year: yearRaw,
    month: monthRaw,
    day: dayRaw,
    hour: hourRaw,
    minute: minuteRaw,
    second: secondRaw = '0',
  } = match.groups ?? {};
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

function isImportableStatus(value: string): boolean {
  const status = value.trim();
  if (!status) {
    return true;
  }

  if (NON_IMPORTABLE_STATUS_KEYWORDS.some((keyword) => status.includes(keyword))) {
    return false;
  }

  return [...SUCCESS_STATUS_KEYWORDS, ...REFUND_STATUS_KEYWORDS].some((keyword) =>
    status.includes(keyword),
  );
}

function includesAny(value: string, keywords: string[]): boolean {
  return keywords.some((keyword) => value.includes(keyword));
}

function inferDirection(input: {
  description: string;
  direction: string;
  merchant: string;
  status: string;
}): {
  direction: BillingTransactionDirection;
  directionConfidence: BillingDirectionConfidence;
} {
  const explicitText = [input.direction, input.status].join(' ');

  if (includesAny(explicitText, CLOSED_DIRECTION_KEYWORDS)) {
    return {
      direction: BILLING_TRANSACTION_DIRECTIONS.closed,
      directionConfidence: BILLING_DIRECTION_CONFIDENCE.high,
    };
  }

  if (includesAny(explicitText, REFUND_DIRECTION_KEYWORDS)) {
    return {
      direction: BILLING_TRANSACTION_DIRECTIONS.refund,
      directionConfidence: BILLING_DIRECTION_CONFIDENCE.high,
    };
  }

  if (
    includesAny(input.direction, INCOME_DIRECTION_KEYWORDS) ||
    includesAny(input.status, INCOME_STATUS_KEYWORDS)
  ) {
    return {
      direction: BILLING_TRANSACTION_DIRECTIONS.income,
      directionConfidence: BILLING_DIRECTION_CONFIDENCE.high,
    };
  }

  if (includesAny(input.direction, EXPENSE_DIRECTION_KEYWORDS)) {
    return {
      direction: BILLING_TRANSACTION_DIRECTIONS.expense,
      directionConfidence: BILLING_DIRECTION_CONFIDENCE.high,
    };
  }

  if (includesAny(input.description, REFUND_DIRECTION_KEYWORDS)) {
    return {
      direction: BILLING_TRANSACTION_DIRECTIONS.refund,
      directionConfidence: BILLING_DIRECTION_CONFIDENCE.medium,
    };
  }

  return {
    direction: BILLING_TRANSACTION_DIRECTIONS.expense,
    directionConfidence: BILLING_DIRECTION_CONFIDENCE.low,
  };
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

  const { header, rule, rows } = findMatchingCsvText(input.bytes, input.rules);
  const headers = header.headers;

  const mapping = rule.columnMapping;
  const amountIndex = getColumnIndex(headers, mapping.amount);
  const transactionAtIndex = getColumnIndex(headers, mapping.transactionAt);
  const merchantIndex = getColumnIndex(headers, mapping.merchant);
  const descriptionIndex = getColumnIndex(headers, mapping.description);
  const directionIndex = getColumnIndex(headers, mapping.direction);
  const externalIdIndex = getColumnIndex(headers, mapping.externalId);
  const statusIndex = getColumnIndex(headers, mapping.status);

  if (amountIndex === null || transactionAtIndex === null) {
    throw new BillingImportError(
      BILLING_IMPORT_ERROR_CODES.invalidCsvRule,
      'CSV 解析规则缺少金额或交易时间列映射',
      500,
    );
  }

  const dataRows = rows.slice(header.index + 1);
  const transactions: BillingNormalizedTransaction[] = [];
  let failedCount = 0;

  for (const row of dataRows) {
    try {
      const amount = readCell(row, amountIndex);
      const transactionAt = readCell(row, transactionAtIndex);
      const direction = readCell(row, directionIndex);
      const rowStatus = readCell(row, statusIndex);
      const merchant = readCell(row, merchantIndex);
      const description = readCell(row, descriptionIndex);
      if (!isImportableStatus(rowStatus)) {
        failedCount += 1;
        continue;
      }
      const directionSemantics = inferDirection({
        description,
        direction,
        merchant,
        status: rowStatus,
      });
      if (directionSemantics.direction === BILLING_TRANSACTION_DIRECTIONS.closed) {
        failedCount += 1;
        continue;
      }

      transactions.push({
        amount_cents: parseAmountCents(amount, directionSemantics.direction),
        transaction_at: parseChinaLocalDateToUtcIso(transactionAt, rule.dateFormat),
        external_transaction_id: normalizeNullable(readCell(row, externalIdIndex)),
        merchant: normalizeNullable(merchant),
        description: normalizeNullable(description),
        direction: directionSemantics.direction,
        direction_confidence: directionSemantics.directionConfidence,
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
