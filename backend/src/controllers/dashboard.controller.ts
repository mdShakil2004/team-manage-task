import type { RequestHandler } from "express";
import { DashboardService } from "../services/dashboard.service.js";

export const DashboardController = {
  summary: (async (req, res) => {
    const data = await DashboardService.summary(req.user!);
    res.status(200).json({ success: true, data });
  }) satisfies RequestHandler,

  activity: (async (req, res) => {
    const data = await DashboardService.activity(req.user!);
    res.status(200).json({ success: true, data });
  }) satisfies RequestHandler,

  overdue: (async (req, res) => {
    const data = await DashboardService.overdue(req.user!);
    res.status(200).json({ success: true, data });
  }) satisfies RequestHandler,
};
