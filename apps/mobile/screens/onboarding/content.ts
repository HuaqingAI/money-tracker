export const AUTH_ROUTES = {
  welcome: '/(auth)/welcome',
  onboarding: '/(auth)/onboarding',
  register: '/(auth)/register',
} as const;

export const WELCOME_PRIMARY_CTA = {
  label: '开始体验',
  href: AUTH_ROUTES.onboarding,
} as const;

export const WELCOME_CONTENT = {
  brand: '了然',
  title: '花了多少，自动知道',
  subtitle: '支付宝、微信的每笔消费，自动归类，不用动手记',
  cta: WELCOME_PRIMARY_CTA,
} as const;

export const ONBOARDING_ACTION_LABELS = {
  skip: '跳过',
  next: '下一步',
  final: '开始体验',
} as const;

export type OnboardingVisualTone = 'capture' | 'categorize' | 'assistant';

export type OnboardingSlide = {
  key: string;
  title: string;
  subtitle: string;
  tone: OnboardingVisualTone;
  ctaLabel: string;
  href?: (typeof AUTH_ROUTES)[keyof typeof AUTH_ROUTES];
};

export const ONBOARDING_SLIDES: readonly OnboardingSlide[] = [
  {
    key: 'capture',
    title: '不用动手记一笔',
    subtitle: '支付宝、微信支付……消费到账自动识别\n不用手动输入，也不会漏掉',
    tone: 'capture',
    ctaLabel: ONBOARDING_ACTION_LABELS.next,
  },
  {
    key: 'categorize',
    title: '每笔花销，自动归类，一目了然',
    subtitle: '餐饮、交通、购物……打开就是分好的\n不用整理，不用对账',
    tone: 'categorize',
    ctaLabel: ONBOARDING_ACTION_LABELS.next,
  },
  {
    key: 'assistant',
    title: '你的AI财务管家，已就位',
    subtitle: '月度报告自动生成，异常消费主动提醒\n从今天起，有人帮你看着钱了',
    tone: 'assistant',
    ctaLabel: ONBOARDING_ACTION_LABELS.final,
    href: AUTH_ROUTES.register,
  },
] as const;
