import { describe, expect, it } from 'vitest';

import { formatAmountCents } from './format-amount';

describe('formatAmountCents', () => {
  it('formats positive amount', () => {
    expect(formatAmountCents(15000)).toBe('¥150.00');
  });

  it('formats zero', () => {
    expect(formatAmountCents(0)).toBe('¥0.00');
  });

  it('formats small amount (1 cent)', () => {
    expect(formatAmountCents(1)).toBe('¥0.01');
  });

  it('formats negative amount', () => {
    expect(formatAmountCents(-5000)).toBe('¥-50.00');
  });

  it('formats large amount', () => {
    expect(formatAmountCents(9999999)).toBe('¥99999.99');
  });
});
