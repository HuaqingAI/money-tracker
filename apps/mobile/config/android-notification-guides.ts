export interface AndroidNotificationGuide {
  key: string;
  matchers: string[];
  badgeLabel: string;
  steps: string[];
  notes: string[];
}

export const androidNotificationGuides: AndroidNotificationGuide[] = [
  {
    key: 'xiaomi',
    matchers: ['xiaomi', 'redmi', 'miui', 'hyperos'],
    badgeLabel: '已识别为小米 / Redmi / HyperOS',
    steps: [
      '点击下方按钮，进入系统通知使用权页面。',
      '在列表中找到“了然”，打开通知读取开关。',
      '返回应用后，系统会自动刷新授权状态。',
    ],
    notes: ['若看不到入口，请搜索“通知使用权”或“通知监听”。'],
  },
  {
    key: 'huawei',
    matchers: ['huawei', 'honor', 'emui', 'harmony'],
    badgeLabel: '已识别为华为 / 荣耀',
    steps: [
      '打开系统设置中的通知使用权。',
      '找到“了然”，允许读取通知。',
      '如系统提示保活优化，请选择允许后台运行。',
    ],
    notes: ['HarmonyOS 设备可能显示为“通知访问”。'],
  },
  {
    key: 'oppo',
    matchers: ['oppo', 'realme', 'coloros'],
    badgeLabel: '已识别为 OPPO / realme',
    steps: [
      '跳转到系统通知监听页面。',
      '找到“了然”并开启权限。',
      '如有后台冻结限制，请在电池设置里允许后台活动。',
    ],
    notes: ['ColorOS 中常见入口名为“通知使用权”。'],
  },
  {
    key: 'vivo',
    matchers: ['vivo', 'iqoo', 'funtouch'],
    badgeLabel: '已识别为 vivo / iQOO',
    steps: [
      '进入通知监听设置页。',
      '开启“了然”的通知读取权限。',
      '返回应用确认状态已切换为“已开启”。',
    ],
    notes: ['FuntouchOS 有时会额外要求开启自启动权限。'],
  },
  {
    key: 'samsung',
    matchers: ['samsung', 'one ui', 'oneui'],
    badgeLabel: '已识别为 Samsung',
    steps: [
      '前往“通知访问”页面。',
      '开启“了然”的权限开关。',
      '确认后返回应用，系统将自动继续下一步。',
    ],
    notes: ['One UI 上入口文案通常为“通知访问”。'],
  },
];

export const genericAndroidNotificationGuide: AndroidNotificationGuide = {
  key: 'generic',
  matchers: [],
  badgeLabel: '未识别具体厂商，使用通用引导',
  steps: [
    '点击下方按钮，进入系统通知监听页面。',
    '找到“了然”，打开通知读取权限。',
    '完成后回到应用，系统会自动检测授权状态。',
  ],
  notes: ['如果系统入口名称不同，请搜索“通知监听”或“通知访问”。'],
};
