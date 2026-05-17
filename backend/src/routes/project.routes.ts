import { Router } from "express";
import { ProjectController } from "../controllers/project.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import {
  addProjectMemberSchema,
  createProjectSchema,
  projectListQuerySchema,
  updateProjectSchema,
} from "../validators/project.validator.js";

const router = Router();

router.use(authenticate);
router.get("/", validate(projectListQuerySchema, "query"), ProjectController.list);
router.post("/", authorizeRoles("ADMIN"), validate(createProjectSchema), ProjectController.create);
router.get("/:id", ProjectController.getById);
router.patch("/:id", validate(updateProjectSchema), ProjectController.update);
router.delete("/:id", authorizeRoles("ADMIN"), ProjectController.remove);
router.post("/:id/members", validate(addProjectMemberSchema), ProjectController.addMember);
router.delete("/:id/members/:userId", ProjectController.removeMember);

export default router;
