import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { inviteSchema, updateRoleSchema } from "../validators/user.validator.js";

const router = Router();

router.use(authenticate);
router.get("/", authorizeRoles("ADMIN"), UserController.list);
router.get("/:id", UserController.getById);
router.patch("/:id/role", authorizeRoles("ADMIN"), validate(updateRoleSchema), UserController.updateRole);
router.post("/invite", authorizeRoles("ADMIN"), validate(inviteSchema), UserController.invite);

export default router;
