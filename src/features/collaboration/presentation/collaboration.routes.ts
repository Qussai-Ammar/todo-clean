import { RequestHandler, Router } from "express";
import { asyncHandler } from "../../../shared/infrastructure/http/async-handler";
import { validateBody } from "../../../shared/infrastructure/http/validate";
import { CollaborationController } from "./collaboration.controller";
import { changeRoleSchema, inviteMemberSchema } from "./dtos";

export function createCollaborationRoutes(
  controller: CollaborationController,
  requireAuth: RequestHandler
): Router {
  const router = Router();

  router.use(requireAuth);

  router.post("/:projectId/members", validateBody(inviteMemberSchema), asyncHandler(controller.invite));
  router.get("/:projectId/members", asyncHandler(controller.list));
  router.patch(
    "/:projectId/members/:userId",
    validateBody(changeRoleSchema),
    asyncHandler(controller.changeRole)
  );
  router.delete("/:projectId/members/:userId", asyncHandler(controller.remove));

  return router;
}
