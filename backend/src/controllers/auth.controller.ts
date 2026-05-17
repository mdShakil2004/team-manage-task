import type { RequestHandler } from "express";
import { AuthService } from "../services/auth.service.js";

export const AuthController = {
  signup: (async (req, res) => {
    const data = await AuthService.signup(req.body);
    res.status(201).json({ success: true, data });
  }) satisfies RequestHandler,

  login: (async (req, res) => {
    const data = await AuthService.login(req.body);
    res.status(200).json({ success: true, data });
  }) satisfies RequestHandler,

  logout: ((_, res) => {
    res.status(200).json({ success: true, message: "Logged out successfully" });
  }) satisfies RequestHandler,

  me: (async (req, res) => {
    const data = await AuthService.me(req.user!.id);
    res.status(200).json({ success: true, data });
  }) satisfies RequestHandler,
};
