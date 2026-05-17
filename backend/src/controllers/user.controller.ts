import type { RequestHandler } from "express";
import { UserService } from "../services/user.service.js";

export const UserController = {
  list: (async (req, res) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const data = await UserService.list(page, limit);
    res.status(200).json({ success: true, data });
  }) satisfies RequestHandler,

  getById: (async (req, res) => {
    const data = await UserService.getById(String(req.params.id));
    res.status(200).json({ success: true, data });
  }) satisfies RequestHandler,

  updateRole: (async (req, res) => {
    const data = await UserService.updateRole(req.user!.id, String(req.params.id), req.body.role);
    res.status(200).json({ success: true, data });
  }) satisfies RequestHandler,

  invite: (async (req, res) => {
    const data = await UserService.invite(req.user!.id, req.body);
    res.status(201).json({ success: true, data });
  }) satisfies RequestHandler,
};
