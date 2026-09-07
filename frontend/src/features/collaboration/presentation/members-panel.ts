import { h } from "../../../shared/dom.js";
import { icon } from "../../../shared/icons.js";
import { CollaboratorRole, Member } from "../domain/member.js";

export interface MembersPanelCallbacks {
  onInvite(email: string, role: CollaboratorRole): Promise<void>;
  onChangeRole(member: Member, role: CollaboratorRole): Promise<void>;
  onRemove(member: Member): Promise<void>;
}

function memberRow(member: Member, isOwner: boolean, currentUserId: string, callbacks: MembersPanelCallbacks): HTMLElement {
  const isSelf = member.userId === currentUserId;

  const roleControl = isOwner
    ? h(
        "select",
        {
          class: "select",
          "aria-label": "Role",
          onchange: (e: Event) => void callbacks.onChangeRole(member, (e.target as HTMLSelectElement).value as CollaboratorRole),
        },
        [
          h("option", { value: "viewer", selected: member.role === "viewer" }, "Viewer"),
          h("option", { value: "editor", selected: member.role === "editor" }, "Editor"),
        ]
      )
    : h("span", { class: `badge ${member.role === "editor" ? "badge-brand" : "badge-neutral"}` }, member.role);

  const actionButton =
    isOwner || isSelf
      ? h(
          "button",
          {
            class: "btn btn-ghost btn-sm",
            onclick: () => void callbacks.onRemove(member),
          },
          isSelf ? "Leave" : "Remove"
        )
      : "";

  return h("div", { class: "member-row" }, [
    h("span", { class: "avatar" }, member.userId.slice(0, 2).toUpperCase()),
    h("div", { class: "member-info" }, [
      h("span", { class: "member-name" }, isSelf ? "You" : "Collaborator"),
      h("span", { class: "member-email" }, `User ${member.userId.slice(0, 8)}`),
    ]),
    roleControl,
    actionButton,
  ]);
}

export function buildMembersPanel(
  members: Member[],
  options: { isOwner: boolean; currentUserId: string },
  callbacks: MembersPanelCallbacks
): HTMLElement {
  const root = h("div", {});

  if (options.isOwner) {
    const emailInput = h("input", {
      class: "input",
      type: "email",
      placeholder: "teammate@example.com",
      required: true,
    }) as HTMLInputElement;

    const roleSelect = h("select", { class: "select" }, [
      h("option", { value: "viewer" }, "Viewer"),
      h("option", { value: "editor" }, "Editor"),
    ]) as HTMLSelectElement;

    const submitButton = h("button", { class: "btn btn-primary", type: "submit" }, [icon("plus", 15), "Invite"]);
    const errorText = h("p", { class: "field-error" });

    const inviteForm = h(
      "form",
      {
        class: "invite-form",
        onsubmit: async (e: SubmitEvent) => {
          e.preventDefault();
          errorText.textContent = "";
          submitButton.setAttribute("disabled", "");
          try {
            await callbacks.onInvite(emailInput.value.trim(), roleSelect.value as CollaboratorRole);
            emailInput.value = "";
          } catch (err) {
            errorText.textContent = err instanceof Error ? err.message : "Could not send invite";
          } finally {
            submitButton.removeAttribute("disabled");
          }
        },
      },
      [emailInput, roleSelect, submitButton]
    );

    root.append(inviteForm, errorText);
  }

  if (members.length === 0) {
    root.append(
      h("div", { class: "empty-state" }, [
        icon("users", 40),
        h("h3", {}, "No collaborators yet"),
        h("p", {}, options.isOwner ? "Invite teammates to work on this project together." : "Only the owner can see this project."),
      ])
    );
    return root;
  }

  root.append(...members.map((member) => memberRow(member, options.isOwner, options.currentUserId, callbacks)));
  return root;
}
