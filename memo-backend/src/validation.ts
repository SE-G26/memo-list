import { z } from 'zod';

const taskFrequencySchema = z.enum(['once', 'daily', 'weekly', 'monthly', 'weekdays']);
const masteryLevelSchema = z.enum(['good', 'fair', 'poor']);

export const listTaskQuerySchema = z.object({
  date: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  includeCompleted: z
    .string()
    .optional()
    .transform((value) => (value === undefined ? true : value !== 'false')),
});

export const createTaskSchema = z.object({
  title: z.string(),
  frequency: taskFrequencySchema,
  reminderTime: z.string().nullable().optional(),
  isLearning: z.boolean(),
  notes: z.string().optional(),
  dueDate: z.string(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().optional(),
    frequency: taskFrequencySchema.optional(),
    reminderTime: z.string().nullable().optional(),
    isLearning: z.boolean().optional(),
    notes: z.string().optional(),
    dueDate: z.string().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required.',
  });

export const completeTaskSchema = z.object({
  learnedContent: z.string().optional(),
  mastery: masteryLevelSchema.optional(),
});
