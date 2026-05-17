import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { ActivityService } from "./activity.service.js";

const userSelect = { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true } as const;

export const UserService = {
  async list(page: number, limit: number) {
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        select: userSelect,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getById(id: string) {
    const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
    if (!user) throw new AppError(404, "User not found", "USER_NOT_FOUND");
    return user;
  },

  async updateRole(actorId: string, id: string, role: Role) {
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) throw new AppError(404, "User not found", "USER_NOT_FOUND");

    const updated = await prisma.user.update({ where: { id }, data: { role }, select: userSelect });
    await ActivityService.log({ action: "role_updated", entityType: "user", entityId: id, userId: actorId, metadata: { role } });
    return updated;
  },

  async invite(actorId: string, input: { name: string; email: string; role: Role; temporaryPassword: string }) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new AppError(409, "Email already in use", "DUPLICATE_EMAIL");

    const password = await bcrypt.hash(input.temporaryPassword, 12);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        role: input.role,
        password,
      },
      select: userSelect,
    });

    await ActivityService.log({ action: "member_invited", entityType: "user", entityId: user.id, userId: actorId });
    return user;
  },
};
