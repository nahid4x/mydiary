import { z } from 'zod'

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export const diarySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  mood: z.string().optional(),
  weather: z.string().optional(),
  privacy: z.enum(['private', 'public']).default('private'),
  tags: z.string().optional(),
  entryDate: z.string().optional(),
})

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(300, 'Bio must be under 300 characters').optional(),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
export const changeEmailSchema = z.object({
  newEmail: z.string().email('Enter a valid email address'),
  currentPassword: z.string().min(1, 'Current password is required'),
})


export const reportTicketSchema = z.object({
  category: z.enum([
    'BUG',
    'FEATURE_REQUEST',
    'PRIVACY_CONCERN',
    'SECURITY_VULNERABILITY',
    'ACCOUNT_ISSUE',
    'PAYMENT',
    'CONTENT_PROBLEM',
    'PERFORMANCE_ISSUE',
    'UI_UX_FEEDBACK',
    'TRANSLATION_ISSUE',
    'DATA_SYNC_ISSUE',
    'OTHER',
  ], { errorMap: () => ({ message: 'Please select a category' }) }),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(150),
  description: z.string().min(20, 'Please describe the issue in more detail').max(5000),
  stepsToReproduce: z.string().max(3000).optional().or(z.literal('')),
  contactPermission: z.boolean().default(false),
})