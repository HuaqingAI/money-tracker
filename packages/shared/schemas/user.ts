import { z } from 'zod';

const avatarUrlSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  },
  z
    .string()
    .max(2048)
    .refine(
      (value) =>
        /^(https?:\/\/|file:\/\/|content:\/\/|asset:\/\/|data:image\/)/i.test(value),
      '头像地址格式无效',
    )
    .nullable(),
);

const genderSchema = z.enum(['male', 'female', 'undisclosed']);

const birthdaySchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  },
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '生日格式必须为 YYYY-MM-DD')
    .refine((value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value &&
        date.getTime() <= Date.now()
      );
    }, '生日必须是有效日期')
    .nullable(),
);

export const updateUserProfileSchema = z.object({
  nickname: z.string().trim().min(1, '昵称不能为空').max(30, '昵称不能超过 30 个字符'),
  avatarUrl: avatarUrlSchema.default(null),
  gender: genderSchema.nullable().default(null),
  birthday: birthdaySchema.default(null),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
