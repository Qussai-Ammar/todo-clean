import { RequestHandler, Router } from "express";
import { asyncHandler } from "../../../shared/infrastructure/http/async-handler";
import { validateBody } from "../../../shared/infrastructure/http/validate";
import { TaskController } from "./task.controller";
import { createTaskSchema, moveTaskSchema, updateTaskSchema } from "./dtos";

export function createTaskRoutes(controller: TaskController, requireAuth: RequestHandler): Router {
  const router = Router();

  router.use(requireAuth);

  router.post("/", validateBody(createTaskSchema), asyncHandler(controller.create));
  router.get("/project/:projectId", asyncHandler(controller.listByProject));
  router.patch("/:taskId", validateBody(updateTaskSchema), asyncHandler(controller.update));
  router.patch("/:taskId/move", validateBody(moveTaskSchema), asyncHandler(controller.move));
  router.delete("/:taskId", asyncHandler(controller.remove));

  return router;
}
