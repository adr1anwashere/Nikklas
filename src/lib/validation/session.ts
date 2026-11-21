import { z } from 'zod';

export const sessionSchema = z.object({
  course_id: z.string().uuid({ message: 'courseRequired' }),
  section: z.string().trim().min(1, { message: 'sectionRequired' }).max(10),
  exam_period: z.enum(['quiz', 'uts', 'uas'], {
    message: 'examPeriodRequired',
  }),
  topic_tags: z
    .array(z.string().trim().min(1).max(30))
    .max(5, { message: 'tagsLimit' }),
  starts_at: z.string().refine(
    (val) => {
      const date = new Date(val);
      // Must be at least 1 minute in the future
      return !isNaN(date.getTime()) && date.getTime() > Date.now() + 60000;
    },
    { message: 'futureTimeError' }
  ),
  max_size: z.coerce
    .number()
    .int()
    .min(2, { message: 'groupSizeError' })
    .max(8, { message: 'groupSizeError' }),
});

export type SessionFormData = z.infer<typeof sessionSchema>;
