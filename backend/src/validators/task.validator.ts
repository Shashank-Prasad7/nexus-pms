import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Task name is required' }).trim().min(1, 'Task name cannot be empty'),
    description: z.string().optional().nullable(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('MEDIUM'),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional().default('PENDING'),
    dueDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
    projectId: z.string({ required_error: 'Project ID is required' }).uuid('Invalid project ID'),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
  body: z.object({
    name: z.string().trim().min(1, 'Task name cannot be empty').optional(),
    description: z.string().optional().nullable(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
    dueDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
    projectId: z.string().uuid('Invalid project ID').optional(),
  }),
});

export const taskQuerySchema = z.object({
  query: z.object({
    projectId: z.string().uuid('Invalid project ID').optional(),
    search: z.string().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ALL']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'ALL']).optional(),
    sortBy: z.enum(['createdAt', 'dueDate', 'name', 'priority', 'status']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }).optional(),
});
