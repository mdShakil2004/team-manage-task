import type { RequestHandler } from "express";
import { TaskService } from "../services/task.service.js";

export const TaskController = {
  list: (async (req, res) => {
    const data = await TaskService.list(req.user!, req.query as never);
    res.status(200).json({ success: true, data });
  }) satisfies RequestHandler,

  create: (async (req, res) => {
    const data = await TaskService.create(req.user!, req.body);
    res.status(201).json({ success: true, data });
  }) satisfies RequestHandler,

  getById: (async (req, res) => {
    const data = await TaskService.getById(req.user!, String(req.params.id));
    res.status(200).json({ success: true, data });
  }) satisfies RequestHandler,

  update: (async (req, res) => {
    const data = await TaskService.update(req.user!, String(req.params.id), req.body);
    res.status(200).json({ success: true, data });
  }) satisfies RequestHandler,

  remove: (async (req, res) => {
    await TaskService.remove(req.user!, String(req.params.id));
    res.status(200).json({ success: true, message: "Task deleted" });
  }) satisfies RequestHandler,

  updateStatus: (async (req, res) => {
    const data = await TaskService.updateStatus(req.user!, String(req.params.id), req.body.status);
    res.status(200).json({ success: true, data });
  }) satisfies RequestHandler,

  assign: (async (req, res) => {
    const data = await TaskService.assign(req.user!, String(req.params.id), req.body.assignedToId);
    res.status(200).json({ success: true, data });
  }) satisfies RequestHandler,
};
