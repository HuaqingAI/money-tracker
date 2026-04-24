import { describe, expect, it } from 'vitest';

import { updateUserProfileSchema } from './user';

describe('updateUserProfileSchema', () => {
  it('accepts a valid nickname and avatar url', () => {
    const result = updateUserProfileSchema.parse({
      nickname: '了然用户',
      avatarUrl: 'https://example.com/avatar.png',
    });

    expect(result).toEqual({
      nickname: '了然用户',
      avatarUrl: 'https://example.com/avatar.png',
    });
  });

  it('normalizes an empty avatar url to null', () => {
    const result = updateUserProfileSchema.parse({
      nickname: 'Sue',
      avatarUrl: '   ',
    });

    expect(result).toEqual({
      nickname: 'Sue',
      avatarUrl: null,
    });
  });

  it('rejects an empty nickname', () => {
    const result = updateUserProfileSchema.safeParse({
      nickname: '   ',
      avatarUrl: null,
    });

    expect(result.success).toBe(false);
  });
});
