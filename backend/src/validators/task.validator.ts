import { TaskPriority, TaskStatus } from "@prisma/client";
import { z } from "zod";

const isoDateSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date format, expected ISO date");

export const createTaskSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  projectId: z.string().min(1),
  assignedToId: z.string().min(1),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  dueDate: isoDateSchema,
});

export const updateTaskSchema = createTaskSchema
  .omit({ projectId: true, assignedToId: true })
  .partial();

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
});

export const assignTaskSchema = z.object({
  assignedToId: z.string().min(1),
});

export const taskListQuerySchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assigneeId: z.string().optional(),
  projectId: z.string().optional(),
  overdue: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((value) => value === "true"),
  sortBy: z.enum(["dueDate", "priority", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
