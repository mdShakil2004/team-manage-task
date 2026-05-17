import type { RequestHandler } from "express";
import { ActivityService } from "../services/activity.service.js";

export const ActivityController = {
  list: (async (req, res) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const data = await ActivityService.list(req.user!.id, req.user!.role, page, limit);
    res.status(200).json({ success: true, data });
  }) satisfies RequestHandler,
};
