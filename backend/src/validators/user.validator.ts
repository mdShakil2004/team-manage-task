import { Role } from "@prisma/client";
import { z } from "zod";

export const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export const inviteSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  role: z.nativeEnum(Role).default(Role.MEMBER),
  temporaryPassword: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/),
});
