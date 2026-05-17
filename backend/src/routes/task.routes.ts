import { Router } from "express";
import { TaskController } from "../controllers/task.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  assignTaskSchema,
  createTaskSchema,
  taskListQuerySchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "../validators/task.validator.js";

const router = Router();

router.use(authenticate);
router.get("/", validate(taskListQuerySchema, "query"), TaskController.list);
router.post("/", validate(createTaskSchema), TaskController.create);
router.get("/:id", TaskController.getById);
router.patch("/:id", validate(updateTaskSchema), TaskController.update);
router.delete("/:id", TaskController.remove);
router.patch("/:id/status", validate(updateTaskStatusSchema), TaskController.updateStatus);
router.patch("/:id/assign", validate(assignTaskSchema), TaskController.assign);

export default router;
