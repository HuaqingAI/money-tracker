import { defaultNotificationRuleSet } from '../constants/default-notification-rules';
import {
  type NotificationCapture,
  notificationCaptureSchema,
  type NotificationEnvelope,
  notificationEnvelopeSchema,
  type NotificationPatternRule,
  type NotificationRuleSet,
  notificationRuleSetSchema,
  type NotificationTimeStrategy,
} from '../schemas/notification-capture';

const CHINA_UTC_OFFSET_HOURS = 8;
const DUPLICATE_WINDOW_MS = 5 * 60 * 1000;

export function normalizeNotificationText(text: string): string {
  return text.replace(/\s+/gu, ' ').trim();
}

export function amountTextToCents(amountText: string): number {
  const normalized = amountText.replace(/[￥¥,\s元]/gu, '');
  const [wholePartRaw = '0', decimalPart = ''] = normalized.split('.');
  const wholePart = wholePartRaw || '0';
  const cents = decimalPart.padEnd(2, '0').slice(0, 2);
  return Number.parseInt(wholePart, 10) * 100 + Number.parseInt(cents, 10);
}

export function normalizeMerchantName(merchantName: string): string {
  return merchantName
    .replace(/^(付款方|收款方|商户|对方户名|付款对象)[:：]?/u, '')
    .replace(/[【】]/gu, '')
    .trim();
}

function buildChinaIsoString(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): string {
  return new Date(
    Date.UTC(year, month - 1, day, hour - CHINA_UTC_OFFSET_HOURS, minute),
  ).toISOString();
}

function resolvePostedAtDate(postedAt?: string): Date {
  if (!postedAt) {
    return new Date();
  }

  const parsed = new Date(postedAt);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function resolveTransactionTime(
  matchedTime: string | undefined,
  postedAt: string | undefined,
  strategy: NotificationTimeStrategy,
): string {
  if (strategy === 'posted-at' || !matchedTime) {
    return resolvePostedAtDate(postedAt).toISOString();
  }

  if (strategy === 'yyyy-mm-dd hh:mm') {
    const parts = matchedTime.match(
      /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2}) (?<hour>\d{2}):(?<minute>\d{2})/u,
    );
    const groups = parts?.groups;

    if (
      groups?.year &&
      groups.month &&
      groups.day &&
      groups.hour &&
      groups.minute
    ) {
      return buildChinaIsoString(
        Number.parseInt(groups.year, 10),
        Number.parseInt(groups.month, 10),
        Number.parseInt(groups.day, 10),
        Number.parseInt(groups.hour, 10),
        Number.parseInt(groups.minute, 10),
      );
    }
  }

  const postedAtDate = resolvePostedAtDate(postedAt);
  const year = postedAtDate.getUTCFullYear();

  if (strategy === 'mm-dd hh:mm') {
    const parts = matchedTime.match(
      /(?<month>\d{2})-(?<day>\d{2}) (?<hour>\d{2}):(?<minute>\d{2})/u,
    );
    const groups = parts?.groups;

    if (groups?.month && groups.day && groups.hour && groups.minute) {
      return buildChinaIsoString(
        year,
        Number.parseInt(groups.month, 10),
        Number.parseInt(groups.day, 10),
        Number.parseInt(groups.hour, 10),
        Number.parseInt(groups.minute, 10),
      );
    }
  }

  if (strategy === 'hh:mm') {
    const parts = matchedTime.match(/(?<hour>\d{2}):(?<minute>\d{2})/u);
    const groups = parts?.groups;

    if (groups?.hour && groups.minute) {
      return buildChinaIsoString(
        year,
        postedAtDate.getUTCMonth() + 1,
        postedAtDate.getUTCDate(),
        Number.parseInt(groups.hour, 10),
        Number.parseInt(groups.minute, 10),
      );
    }
  }

  return postedAtDate.toISOString();
}

function matchesRule(
  rule: NotificationPatternRule,
  envelope: NotificationEnvelope,
  normalizedSource: string,
): boolean {
  const normalizedPackageName = envelope.packageName?.toLowerCase() ?? '';

  const packageMatch =
    rule.packageNames.length === 0 ||
    rule.packageNames.some((packageName) =>
      normalizedPackageName.includes(packageName.toLowerCase()),
    );

  const titleMatch =
    rule.titleKeywords.length === 0 ||
    rule.titleKeywords.some((keyword) => normalizedSource.includes(keyword));

  return packageMatch && titleMatch;
}

export function normalizeNotificationCapture(
  capture: NotificationCapture,
): NotificationCapture {
  return notificationCaptureSchema.parse({
    ...capture,
    amountCents: Math.abs(capture.amountCents),
    merchantName: normalizeMerchantName(capture.merchantName),
    transactionTime: new Date(capture.transactionTime).toISOString(),
  });
}

export function extractNotificationCapture(
  input: NotificationEnvelope,
  rules: NotificationRuleSet = defaultNotificationRuleSet,
): NotificationCapture | null {
  const envelope = notificationEnvelopeSchema.parse(input);
  const ruleSet = notificationRuleSetSchema.parse(rules);
  const normalizedSource = normalizeNotificationText(
    `${envelope.title ?? ''} ${envelope.text}`,
  );

  for (const rule of ruleSet.rules) {
    if (!matchesRule(rule, envelope, normalizedSource)) {
      continue;
    }

    const matcher = new RegExp(rule.textPattern, 'u');
    const matched = matcher.exec(normalizedSource);

    const amount = matched?.groups?.amount;
    const merchant = matched?.groups?.merchant;

    if (!amount || !merchant) {
      continue;
    }

    return normalizeNotificationCapture({
      amountCents: amountTextToCents(amount),
      merchantName: merchant,
      transactionTime: resolveTransactionTime(
        matched?.groups?.time,
        envelope.postedAt,
        rule.timeStrategy,
      ),
      platform: rule.platform,
    });
  }

  return null;
}

export function isDuplicateNotificationCapture(
  existingCaptures: NotificationCapture[],
  candidate: NotificationCapture,
  windowMs = DUPLICATE_WINDOW_MS,
): boolean {
  const normalizedCandidate = normalizeNotificationCapture(candidate);
  const candidateTime = new Date(normalizedCandidate.transactionTime).getTime();

  return existingCaptures.some((existingCapture) => {
    const normalizedExisting = normalizeNotificationCapture(existingCapture);
    const existingTime = new Date(normalizedExisting.transactionTime).getTime();

    return (
      normalizedExisting.amountCents === normalizedCandidate.amountCents &&
      normalizedExisting.merchantName.toLowerCase() ===
        normalizedCandidate.merchantName.toLowerCase() &&
      Math.abs(existingTime - candidateTime) <= windowMs
    );
  });
}
