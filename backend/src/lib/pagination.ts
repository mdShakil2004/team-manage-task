import { z } from "zod";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const getPagination = (query: Record<string, unknown>) => {
  const { page, limit } = paginationSchema.parse(query);
  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};
