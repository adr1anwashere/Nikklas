import { z } from 'zod';

export const meetingPlaceSchema = z.object({
  description: z
    .string()
    .trim()
    .min(2, { message: 'descRequired' })
    .max(300, { message: 'descMax' }),
  map_url: z
    .string()
    .trim()
    .refine((val) => !val || /^https:\/\//i.test(val), {
      message: 'invalidHttps',
    })
    .optional(),
});

export type MeetingPlaceFormData = z.infer<typeof meetingPlaceSchema>;
