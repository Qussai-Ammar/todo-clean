import { DialogManager } from "../../../shared/dialog.js";
import { h } from "../../../shared/dom.js";
import { ToastManager } from "../../../shared/toast.js";
import { ChangeRoleUseCase } from "../application/change-role.usecase.js";
import { InviteMemberUseCase } from "../application/invite-member.usecase.js";
import { ListMembersUseCase } from "../application/list-members.usecase.js";
import { RemoveMemberUseCase } from "../application/remove-member.usecase.js";
import { buildMembersPanel } from "./members-panel.js";

export class MembersController {
  constructor(
    private readonly listMembersUseCase: ListMembersUseCase,
    private readonly inviteMemberUseCase: InviteMemberUseCase,
    private readonly changeRoleUseCase: ChangeRoleUseCase,
    private readonly removeMemberUseCase: RemoveMemberUseCase,
    private readonly toast: ToastManager,
    private readonly dialogs: DialogManager
  ) {}

  async render(
    container: HTMLElement,
    projectId: string,
    context: { isOwner: boolean; currentUserId: string; onSelfLeft: () => void }
  ): Promise<void> {
    container.replaceChildren(
      h("div", {}, Array.from({ length: 2 }, () => h("div", { class: "skeleton", style: "height:56px; border-radius:10px; margin-bottom:8px;" })))
    );

    try {
      const members = await this.listMembersUseCase.execute(projectId);
      const panel = buildMembersPanel(members, { isOwner: context.isOwner, currentUserId: context.currentUserId }, {
        onInvite: async (email, role) => {
          await this.inviteMemberUseCase.execute(projectId, email, role);
          this.toast.success(`Invited ${email}`);
          await this.render(container, projectId, context);
        },
        onChangeRole: async (member, role) => {
          await this.changeRoleUseCase.execute(projectId, member.userId, role);
          this.toast.success("Role updated");
          await this.render(container, projectId, context);
        },
        onRemove: async (member) => {
          const isSelf = member.userId === context.currentUserId;
          const confirmed = await this.dialogs.confirm({
            title: isSelf ? "Leave this project?" : "Remove this collaborator?",
            message: isSelf
              ? "You'll lose access to this project until someone invites you again."
              : "They will immediately lose access to this project.",
            confirmLabel: isSelf ? "Leave project" : "Remove",
            danger: true,
          });
          if (!confirmed) return;

          await this.removeMemberUseCase.execute(projectId, member.userId);
          this.toast.success(isSelf ? "You left the project" : "Collaborator removed");
          if (isSelf) {
            context.onSelfLeft();
          } else {
            await this.render(container, projectId, context);
          }
        },
      });
      container.replaceChildren(panel);
    } catch (err) {
      this.toast.error(err instanceof Error ? err.message : "Could not load collaborators");
      container.replaceChildren();
    }
  }
}
