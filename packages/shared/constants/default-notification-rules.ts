import type { NotificationRuleSet } from '../schemas/notification-capture';

export const defaultNotificationRuleSet: NotificationRuleSet = {
  version: '2026-04-24.1',
  updatedAt: '2026-04-24T00:00:00.000Z',
  rules: [
    {
      id: 'alipay-payment-notice',
      platform: 'alipay',
      packageNames: ['com.eg.android.AlipayGphone'],
      titleKeywords: ['支付宝'],
      textPattern:
        '支付宝.*?(?<amount>\\d+(?:\\.\\d{1,2})?)元.*?(?:付款方|收款方|商户)[:：]?(?<merchant>[^，。；;]+?)(?:[，。；;]|$).*?(?:时间[:：]?(?<time>\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}|\\d{2}-\\d{2} \\d{2}:\\d{2}))?',
      timeStrategy: 'yyyy-mm-dd hh:mm',
    },
    {
      id: 'wechat-payment-notice',
      platform: 'wechat',
      packageNames: ['com.tencent.mm'],
      titleKeywords: ['微信'],
      textPattern:
        '微信支付.*?(?<amount>\\d+(?:\\.\\d{1,2})?)元.*?(?:付款方|收款方|商户)[:：]?(?<merchant>[^，。；;]+?)(?:[，。；;]|$).*?(?:时间[:：]?(?<time>\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}|\\d{2}-\\d{2} \\d{2}:\\d{2}))?',
      timeStrategy: 'yyyy-mm-dd hh:mm',
    },
    {
      id: 'icbc-debit-notice',
      platform: 'icbc',
      packageNames: [],
      titleKeywords: ['工商银行'],
      textPattern:
        '工商银行.*?(?:消费|支出|收入).*?(?<amount>\\d+(?:\\.\\d{1,2})?)元.*?(?:商户|对方户名|付款对象)[:：]?(?<merchant>[^，。；;]+?)(?:[，。；;]|$).*?(?:时间[:：]?(?<time>\\d{2}-\\d{2} \\d{2}:\\d{2}))?',
      timeStrategy: 'mm-dd hh:mm',
    },
    {
      id: 'cmb-debit-notice',
      platform: 'cmb',
      packageNames: [],
      titleKeywords: ['招商银行'],
      textPattern:
        '招商银行.*?(?:支付|消费|支出).*?(?<merchant>[^，。；;]+?)[:：，].*?(?<amount>\\d+(?:\\.\\d{1,2})?)元.*?(?:时间[:：]?(?<time>\\d{2}-\\d{2} \\d{2}:\\d{2}))?',
      timeStrategy: 'mm-dd hh:mm',
    },
    {
      id: 'ccb-debit-notice',
      platform: 'ccb',
      packageNames: [],
      titleKeywords: ['建设银行'],
      textPattern:
        '建设银行.*?(?:消费|支付).*?(?<amount>\\d+(?:\\.\\d{1,2})?)元.*?(?:商户|付款对象)[:：]?(?<merchant>[^，。；;]+?)(?:[，。；;]|$).*?(?<time>\\d{2}-\\d{2} \\d{2}:\\d{2})?',
      timeStrategy: 'mm-dd hh:mm',
    },
    {
      id: 'generic-bank-notice',
      platform: 'bank',
      packageNames: [],
      titleKeywords: ['银行'],
      textPattern:
        '(?<merchant>[^，。；;]{2,20}?)(?:消费|支付|收款).*?(?<amount>\\d+(?:\\.\\d{1,2})?)元',
      timeStrategy: 'posted-at',
    },
  ],
};
