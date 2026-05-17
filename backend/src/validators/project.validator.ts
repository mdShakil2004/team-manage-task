import { ProjectStatus } from "@prisma/client";
import { z } from "zod";

const isoDateSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date format, expected ISO date");

const projectBaseSchema = z.object({
  name: z.string().min(3).max(120),
  description: z.string().max(1000).optional(),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.PLANNING),
  startDate: isoDateSchema,
  dueDate: isoDateSchema,
});

export const createProjectSchema = projectBaseSchema.superRefine((data, ctx) => {
  if (new Date(data.startDate) > new Date(data.dueDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["dueDate"],
      message: "dueDate must be after startDate",
    });
  }
});

export const updateProjectSchema = projectBaseSchema.partial().superRefine((data, ctx) => {
  if (data.startDate && data.dueDate && new Date(data.startDate) > new Date(data.dueDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["dueDate"],
      message: "dueDate must be after startDate",
    });
  }
});

export const addProjectMemberSchema = z.object({
  userId: z.string().min(1),
});

export const projectListQuerySchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  ownerId: z.string().optional(),
  sortBy: z.enum(["dueDate"]).default("dueDate"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});