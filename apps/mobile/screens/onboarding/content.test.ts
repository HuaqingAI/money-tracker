import { describe, expect, it } from 'vitest';

import {
  AUTH_ROUTES,
  ONBOARDING_ACTION_LABELS,
  ONBOARDING_SLIDES,
  WELCOME_PRIMARY_CTA,
} from './content';

describe('onboarding content', () => {
  it('defines the auth flow route targets', () => {
    expect(AUTH_ROUTES.welcome).toBe('/(auth)/welcome');
    expect(AUTH_ROUTES.onboarding).toBe('/(auth)/onboarding');
    expect(AUTH_ROUTES.register).toBe('/(auth)/register');
  });

  it('uses the refined welcome CTA and final onboarding CTA copy', () => {
    expect(WELCOME_PRIMARY_CTA.label).toBe('开始体验');
    expect(WELCOME_PRIMARY_CTA.href).toBe(AUTH_ROUTES.onboarding);
    expect(ONBOARDING_ACTION_LABELS.final).toBe('开始体验');
  });

  it('defines exactly three onboarding slides in the expected order', () => {
    expect(ONBOARDING_SLIDES).toHaveLength(3);
    expect(ONBOARDING_SLIDES.map((slide) => slide.title)).toEqual([
      '不用动手记一笔',
      '每笔花销，自动归类，一目了然',
      '你的AI财务管家，已就位',
    ]);
  });

  it('routes skip and the last slide CTA to the register placeholder', () => {
    expect(ONBOARDING_ACTION_LABELS.skip).toBe('跳过');
    expect(ONBOARDING_SLIDES[2]?.ctaLabel).toBe('开始体验');
    expect(ONBOARDING_SLIDES[2]?.href).toBe(AUTH_ROUTES.register);
  });
});
