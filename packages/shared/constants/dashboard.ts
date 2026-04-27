export const DASHBOARD_ROUTE_PATHS = {
  monthlySummary: '/api/analytics/monthly-summary',
  recentTransactions: '/api/billing/transactions',
} as const;

export const DASHBOARD_ERROR_CODES = {
  authUnauthorized: 'AUTH_UNAUTHORIZED',
  invalidMonth: 'DASHBOARD_INVALID_MONTH',
  invalidLimit: 'DASHBOARD_INVALID_LIMIT',
  monthlySummaryFailed: 'DASHBOARD_MONTHLY_SUMMARY_FAILED',
  recentTransactionsFailed: 'DASHBOARD_RECENT_TRANSACTIONS_FAILED',
} as const;

export const DASHBOARD_RECENT_TRANSACTIONS_DEFAULT_LIMIT = 10;
export const DASHBOARD_RECENT_TRANSACTIONS_MAX_LIMIT = 50;

export const DASHBOARD_CATEGORY_DISPLAY = {
  dining: {
    color: '#F97316',
    icon: '🍽',
    keywords: ['餐饮', '外卖', '美食', '咖啡', '奶茶', '饭'],
    name: '餐饮',
  },
  transport: {
    color: '#3B82F6',
    icon: '🚗',
    keywords: ['交通', '打车', '地铁', '公交', '停车', '加油'],
    name: '交通',
  },
  shopping: {
    color: '#8B5CF6',
    icon: '🛒',
    keywords: ['购物', '淘宝', '京东', '电商', '超市'],
    name: '购物',
  },
  housing: {
    color: '#06B6D4',
    icon: '🏠',
    keywords: ['居住', '房租', '物业', '水电', '燃气'],
    name: '居住',
  },
  fun: {
    color: '#EC4899',
    icon: '🎮',
    keywords: ['娱乐', '电影', '游戏', '会员'],
    name: '娱乐',
  },
  health: {
    color: '#22C55E',
    icon: '💊',
    keywords: ['健康', '医疗', '药', '医院'],
    name: '健康',
  },
  other: {
    color: '#6B7280',
    icon: '📦',
    keywords: [],
    name: '其他',
  },
} as const;

