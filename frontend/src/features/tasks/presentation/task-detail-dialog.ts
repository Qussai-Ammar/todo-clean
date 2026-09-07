import { DialogManager } from "../../../shared/dialog.js";
import { h } from "../../../shared/dom.js";
import { icon } from "../../../shared/icons.js";
import { Task } from "../domain/task.js";

export interface TaskDetailCallbacks {
  onSave: (fields: { title: string; description: string }) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function openTaskDetailDialog(dialogs: DialogManager, task: Task, callbacks: TaskDetailCallbacks): void {
  const titleInput = h("input", { class: "input", value: task.title, "aria-label": "Task title" }) as HTMLInputElement;

  const descTextarea = h(
    "textarea",
    { class: "input", placeholder: "Add a description…", rows: "4" },
    task.description
  ) as HTMLTextAreaElement;

  const banner = h("p", { class: "field-error" });

  const deleteButton = h(
    "button",
    { class: "btn btn-danger", type: "button" },
    [icon("trash", 15), "Delete"]
  );

  const cancelButton = h("button", { class: "btn btn-secondary", type: "button" }, "Cancel");
  const saveButton = h("button", { class: "btn btn-primary", type: "submit" }, "Save changes");

  const form = h(
    "form",
    {
      style: "display:flex; flex-direction:column; gap:16px;",
      onsubmit: async (e: SubmitEvent) => {
        e.preventDefault();
        const title = titleInput.value.trim();
        if (!title) {
          banner.textContent = "Task title cannot be empty";
          return;
        }
        banner.textContent = "";
        saveButton.setAttribute("disabled", "");
        try {
          await callbacks.onSave({ title, description: descTextarea.value.trim() });
          close();
        } catch (err) {
          banner.textContent = err instanceof Error ? err.message : "Could not save changes";
        } finally {
          saveButton.removeAttribute("disabled");
        }
      },
    },
    [
      h("label", { class: "field" }, [h("span", { class: "field-label" }, "Title"), titleInput]),
      h("label", { class: "field" }, [h("span", { class: "field-label" }, "Description"), descTextarea]),
      banner,
      h("div", { class: "dialog-actions", style: "justify-content:space-between; margin-top:4px;" }, [
        deleteButton,
        h("div", { style: "display:flex; gap:12px;" }, [cancelButton, saveButton]),
      ]),
    ]
  );

  const close = dialogs.open({ title: "Task details", body: form });
  cancelButton.addEventListener("click", close);

  deleteButton.addEventListener("click", async () => {
    deleteButton.setAttribute("disabled", "");
    try {
      await callbacks.onDelete();
      close();
    } catch (err) {
      banner.textContent = err instanceof Error ? err.message : "Could not delete task";
      deleteButton.removeAttribute("disabled");
    }
  });
}
