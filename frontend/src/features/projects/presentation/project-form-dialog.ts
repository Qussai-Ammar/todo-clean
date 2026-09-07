import { DialogManager } from "../../../shared/dialog.js";
import { h } from "../../../shared/dom.js";
import { createField } from "../../../shared/form-field.js";
import { Project } from "../domain/project.js";

export interface ProjectFormValues {
  name: string;
  description: string;
}

export function openProjectFormDialog(
  dialogs: DialogManager,
  options: {
    mode: "create" | "edit";
    initial?: Project;
    onSubmit: (values: ProjectFormValues) => Promise<void>;
  }
): void {
  const nameField = createField({
    label: "Project name",
    name: "name",
    placeholder: "Website redesign",
    required: true,
    autoFocus: true,
    value: options.initial?.name ?? "",
  });

  const descField = h("label", { class: "field" }, [
    h("span", { class: "field-label" }, "Description"),
    h("textarea", {
      class: "input",
      name: "description",
      placeholder: "What is this project about? (optional)",
    }, options.initial?.description ?? ""),
  ]);

  const textarea = descField.querySelector("textarea") as HTMLTextAreaElement;
  const banner = h("p", { class: "field-error" });

  const cancelButton = h("button", { class: "btn btn-secondary", type: "button" }, "Cancel");
  const submitButton = h(
    "button",
    { class: "btn btn-primary", type: "submit" },
    options.mode === "create" ? "Create project" : "Save changes"
  );

  const form = h(
    "form",
    {
      style: "display:flex; flex-direction:column; gap:16px;",
      onsubmit: async (e: SubmitEvent) => {
        e.preventDefault();
        const name = nameField.input.value.trim();
        if (!name) {
          nameField.setError("Project name is required");
          return;
        }
        nameField.setError("");
        banner.textContent = "";
        submitButton.setAttribute("disabled", "");
        try {
          await options.onSubmit({ name, description: textarea.value.trim() });
          close();
        } catch (err) {
          banner.textContent = err instanceof Error ? err.message : "Something went wrong";
        } finally {
          submitButton.removeAttribute("disabled");
        }
      },
    },
    [
      nameField.root,
      descField,
      banner,
      h("div", { class: "dialog-actions", style: "margin-top: 4px;" }, [cancelButton, submitButton]),
    ]
  );

  const close = dialogs.open({
    title: options.mode === "create" ? "New project" : "Edit project",
    body: form,
  });

  cancelButton.addEventListener("click", close);
}
