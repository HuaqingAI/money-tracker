import { describe, expect, it } from 'vitest';

import { maskPhoneNumber } from './mask-phone-number';

describe('maskPhoneNumber', () => {
  it('masks a mainland phone number', () => {
    expect(maskPhoneNumber('13812345678')).toBe('138****5678');
  });

  it('masks a phone number with country code', () => {
    expect(maskPhoneNumber('+8613812345678')).toBe('+86****5678');
  });

  it('returns null when phone number is absent', () => {
    expect(maskPhoneNumber(null)).toBeNull();
  });

  it('returns short values unchanged', () => {
    expect(maskPhoneNumber('12345')).toBe('12345');
  });
});
