import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, signupSchema } from "../validators/auth.validator.js";

const router = Router();

router.post("/signup", validate(signupSchema), AuthController.signup);
router.post("/login", validate(loginSchema), AuthController.login);
router.post("/logout", authenticate, AuthController.logout);
router.get("/me", authenticate, AuthController.me);

export default router;
