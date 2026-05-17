import { prisma } from "../lib/prisma.js";
import type { Prisma } from "@prisma/client";

export const ActivityService = {
  async log(input: {
    action: string;
    entityType: string;
    entityId: string;
    userId: string;
    metadata?: Record<string, unknown>;
  }) {
    await prisma.activityLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        userId: input.userId,
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  },

  async list(userId: string, role: "ADMIN" | "MEMBER", page: number, limit: number) {
    const where = role === "ADMIN" ? {} : { userId };
    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },
};
