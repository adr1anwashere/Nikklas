import { z } from 'zod';

export const profileSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(2, { message: 'nicknameRequired' })
    .max(30, { message: 'nicknameMax' }),
  major: z
    .string()
    .trim()
    .min(2, { message: 'majorRequired' })
    .max(60, { message: 'majorMax' }),
  year: z.coerce
    .number()
    .int()
    .min(1, { message: 'yearRequired' })
    .max(6, { message: 'yearRequired' }),
  topic_tags: z
    .array(z.string().trim().min(1).max(30))
    .max(5, { message: 'tagsLimit' }),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
