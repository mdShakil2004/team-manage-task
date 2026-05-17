import type { RequestHandler } from "express";
import { ProjectService } from "../services/project.service.js";

export const ProjectController = {
  list: (async (req, res) => {
    const data = await ProjectService.list(req.user!, req.query as never);
    res.status(200).json({ success: true, data });
  }) satisfies RequestHandler,

  create: (async (req, res) => {
    const data = await ProjectService.create(req.user!.id, req.body);
    res.status(201).json({ success: true, data });
  }) satisfies RequestHandler,

  getById: (async (req, res) => {
    const data = await ProjectService.getById(req.user!, String(req.params.id));
    res.status(200).json({ success: true, data });
  }) satisfies RequestHandler,

  update: (async (req, res) => {
    const data = await ProjectService.update(req.user!, String(req.params.id), req.body);
    res.status(200).json({ success: true, data });
  }) satisfies RequestHandler,

  remove: (async (req, res) => {
    await ProjectService.remove(req.user!, String(req.params.id));
    res.status(200).json({ success: true, message: "Project deleted" });
  }) satisfies RequestHandler,

  addMember: (async (req, res) => {
    await ProjectService.addMember(req.user!, String(req.params.id), req.body.userId);
    res.status(201).json({ success: true, message: "Member added" });
  }) satisfies RequestHandler,

  removeMember: (async (req, res) => {
    await ProjectService.removeMember(req.user!, String(req.params.id), String(req.params.userId));
    res.status(200).json({ success: true, message: "Member removed" });
  }) satisfies RequestHandler,
};
