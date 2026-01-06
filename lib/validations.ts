import { z } from 'zod';

// Project validation schema
export const createProjectSchema = z.object({
  name: z.string()
    .min(1, 'Project name is required')
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name must be less than 100 characters')
    .trim(),
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;

// Feedback validation schema
export const createFeedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'other'], {
    required_error: 'Please select a feedback type',
  }),
  message: z.string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters')
    .trim(),
  userName: z.string()
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  userEmail: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .trim()
    .optional()
    .or(z.literal('')),
});

export type CreateFeedbackFormData = z.infer<typeof createFeedbackSchema>;

// Label validation schema
export const addLabelSchema = z.object({
  label: z.string()
    .min(1, 'Label is required')
    .min(2, 'Label must be at least 2 characters')
    .max(50, 'Label must be less than 50 characters')
    .trim(),
});

export type AddLabelFormData = z.infer<typeof addLabelSchema>;
