import { DialogManager } from "../../shared/dialog.js";
import { HttpClient } from "../../shared/http-client.js";
import { ToastManager } from "../../shared/toast.js";
import { ChangeRoleUseCase } from "./application/change-role.usecase.js";
import { InviteMemberUseCase } from "./application/invite-member.usecase.js";
import { ListMembersUseCase } from "./application/list-members.usecase.js";
import { RemoveMemberUseCase } from "./application/remove-member.usecase.js";
import { HttpCollaborationApi } from "./infrastructure/http-collaboration-api.js";
import { MembersController } from "./presentation/members.controller.js";

export function createCollaborationFeature(deps: {
  http: HttpClient;
  toast: ToastManager;
  dialogs: DialogManager;
}): MembersController {
  const collaborationApi = new HttpCollaborationApi(deps.http);

  return new MembersController(
    new ListMembersUseCase(collaborationApi),
    new InviteMemberUseCase(collaborationApi),
    new ChangeRoleUseCase(collaborationApi),
    new RemoveMemberUseCase(collaborationApi),
    deps.toast,
    deps.dialogs
  );
}

export type { CollaboratorRole, Member } from "./domain/member.js";
export { MembersController } from "./presentation/members.controller.js";
