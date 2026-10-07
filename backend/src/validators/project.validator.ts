import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Project name is required' }).trim().min(1, 'Project name cannot be empty'),
    description: z.string().optional().nullable(),
    status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).optional().default('NOT_STARTED'),
    startDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
    endDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID'),
  }),
  body: z.object({
    name: z.string().trim().min(1, 'Project name cannot be empty').optional(),
    description: z.string().optional().nullable(),
    status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).optional(),
    startDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
    endDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  }),
});

export const projectQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ALL']).optional(),
    sortBy: z.enum(['createdAt', 'name', 'startDate', 'endDate', 'status']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }).optional(),
});
