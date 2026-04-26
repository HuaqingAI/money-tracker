import { describe, expect, it } from 'vitest';

import { updateUserProfileSchema } from './user';

describe('updateUserProfileSchema', () => {
  it('accepts a valid nickname and avatar url', () => {
    const result = updateUserProfileSchema.parse({
      avatarUrl: 'https://example.com/avatar.png',
      birthday: '1996-03-15',
      gender: 'female',
      nickname: '了然用户',
    });

    expect(result).toEqual({
      avatarUrl: 'https://example.com/avatar.png',
      birthday: '1996-03-15',
      gender: 'female',
      nickname: '了然用户',
    });
  });

  it('accepts local image picker uris during MVP profile editing', () => {
    const result = updateUserProfileSchema.parse({
      nickname: 'Sue',
      avatarUrl: 'file:///avatar.jpg',
    });

    expect(result.avatarUrl).toBe('file:///avatar.jpg');
  });

  it('normalizes an empty avatar url to null', () => {
    const result = updateUserProfileSchema.parse({
      nickname: 'Sue',
      avatarUrl: '   ',
    });

    expect(result).toEqual({
      avatarUrl: null,
      birthday: null,
      gender: null,
      nickname: 'Sue',
    });
  });

  it('rejects invalid birthday values', () => {
    const result = updateUserProfileSchema.safeParse({
      avatarUrl: null,
      birthday: '2026-02-31',
      gender: null,
      nickname: 'Sue',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an empty nickname', () => {
    const result = updateUserProfileSchema.safeParse({
      nickname: '   ',
      avatarUrl: null,
    });

    expect(result.success).toBe(false);
  });
});
