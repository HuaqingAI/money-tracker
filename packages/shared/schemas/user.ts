import { z } from 'zod';

const avatarUrlSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  },
  z.string().url().max(2048).nullable(),
);

export const updateUserProfileSchema = z.object({
  nickname: z.string().trim().min(1, '昵称不能为空').max(30, '昵称不能超过 30 个字符'),
  avatarUrl: avatarUrlSchema.default(null),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
