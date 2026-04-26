import { describe, expect, it } from 'vitest';

import { defaultNotificationRuleSet } from '../constants/default-notification-rules';
import type { NotificationEnvelope } from '../schemas/notification-capture';
import {
  extractNotificationCapture,
  isDuplicateNotificationCapture,
} from './notification-capture';

describe('extractNotificationCapture', () => {
  const cases: Array<{
    name: string;
    envelope: NotificationEnvelope;
    expected: {
      amountCents: number;
      merchantName: string;
      platform: string;
      transactionTime: string;
    };
  }> = [
    {
      name: 'parses an Alipay payment notification',
      envelope: {
        packageName: 'com.eg.android.AlipayGphone',
        title: '支付宝',
        text: '支付宝成功收款12.34元，付款方：瑞幸咖啡，时间：2026-04-24 09:30',
        postedAt: '2026-04-24T01:30:00.000Z',
      },
      expected: {
        amountCents: 1234,
        merchantName: '瑞幸咖啡',
        platform: 'alipay',
        transactionTime: '2026-04-24T01:30:00.000Z',
      },
    },
    {
      name: 'parses a WeChat payment notification',
      envelope: {
        packageName: 'com.tencent.mm',
        title: '微信支付',
        text: '微信支付到账58.80元，商户：便利蜂，时间：2026-04-24 10:11',
        postedAt: '2026-04-24T02:11:00.000Z',
      },
      expected: {
        amountCents: 5880,
        merchantName: '便利蜂',
        platform: 'wechat',
        transactionTime: '2026-04-24T02:11:00.000Z',
      },
    },
    {
      name: 'parses an ICBC notification',
      envelope: {
        title: '中国工商银行',
        text: '【工商银行】您尾号1234卡消费18.50元，商户：美团外卖，时间：04-24 11:00',
        postedAt: '2026-04-24T03:00:00.000Z',
      },
      expected: {
        amountCents: 1850,
        merchantName: '美团外卖',
        platform: 'icbc',
        transactionTime: '2026-04-24T03:00:00.000Z',
      },
    },
    {
      name: 'parses a CMB notification',
      envelope: {
        title: '招商银行',
        text: '【招商银行】支付 美宜佳：26.20元，时间：04-24 12:05',
        postedAt: '2026-04-24T04:05:00.000Z',
      },
      expected: {
        amountCents: 2620,
        merchantName: '美宜佳',
        platform: 'cmb',
        transactionTime: '2026-04-24T04:05:00.000Z',
      },
    },
    {
      name: 'parses a CCB notification',
      envelope: {
        title: '中国建设银行',
        text: '【建设银行】龙支付消费45.00元，商户：星巴克，04-24 13:20',
        postedAt: '2026-04-24T05:20:00.000Z',
      },
      expected: {
        amountCents: 4500,
        merchantName: '星巴克',
        platform: 'ccb',
        transactionTime: '2026-04-24T05:20:00.000Z',
      },
    },
  ];

  for (const testCase of cases) {
    it(testCase.name, () => {
      expect(
        extractNotificationCapture(
          testCase.envelope,
          defaultNotificationRuleSet,
        ),
      ).toEqual(testCase.expected);
    });
  }

  it('returns null for unsupported notification text', () => {
    expect(
      extractNotificationCapture({
        title: '短信',
        text: '欢迎使用了然，今天也要记得喝水。',
        postedAt: '2026-04-24T05:20:00.000Z',
      }),
    ).toBeNull();
  });
});

describe('isDuplicateNotificationCapture', () => {
  it('treats the same amount, merchant, and nearby transaction time as duplicate', () => {
    const existing = [
      {
        amountCents: 3200,
        merchantName: '山姆会员商店',
        platform: 'alipay' as const,
        transactionTime: '2026-04-24T04:00:00.000Z',
      },
    ];

    const candidate = {
      amountCents: 3200,
      merchantName: '山姆会员商店',
      platform: 'alipay' as const,
      transactionTime: '2026-04-24T04:04:00.000Z',
    };

    expect(isDuplicateNotificationCapture(existing, candidate)).toBe(true);
  });

  it('does not treat captures outside the five-minute window as duplicate', () => {
    const existing = [
      {
        amountCents: 3200,
        merchantName: '山姆会员商店',
        platform: 'alipay' as const,
        transactionTime: '2026-04-24T04:00:00.000Z',
      },
    ];

    const candidate = {
      amountCents: 3200,
      merchantName: '山姆会员商店',
      platform: 'alipay' as const,
      transactionTime: '2026-04-24T04:06:00.000Z',
    };

    expect(isDuplicateNotificationCapture(existing, candidate)).toBe(false);
  });
});
