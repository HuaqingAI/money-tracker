import {
  defaultNotificationRuleSet,
  type NotificationRuleSet,
  notificationRuleSetSchema,
} from '@money-tracker/shared';

const FALLBACK_NOTIFICATION_RULES_JSON = JSON.stringify(
  defaultNotificationRuleSet,
);

export function resolveNotificationRules(): NotificationRuleSet {
  const rawRules =
    process.env.NOTIFICATION_RULES_JSON ?? FALLBACK_NOTIFICATION_RULES_JSON;

  try {
    const parsed = JSON.parse(rawRules) as unknown;
    return notificationRuleSetSchema.parse(parsed);
  } catch {
    return defaultNotificationRuleSet;
  }
}
