import { h } from "../../../shared/dom.js";
import { icon } from "../../../shared/icons.js";

export function buildNewTaskForm(onCreate: (title: string) => Promise<void>): HTMLElement {
  const input = h("input", {
    class: "input",
    type: "text",
    placeholder: "Add a task and press Enter…",
    "aria-label": "New task title",
  }) as HTMLInputElement;

  const button = h("button", { class: "btn btn-primary", type: "submit" }, [icon("plus", 16), "Add task"]);

  const form = h(
    "form",
    {
      style: "display:flex; gap:12px; margin-bottom: 20px;",
      onsubmit: async (e: SubmitEvent) => {
        e.preventDefault();
        const title = input.value.trim();
        if (!title) return;
        input.setAttribute("disabled", "");
        button.setAttribute("disabled", "");
        try {
          await onCreate(title);
          input.value = "";
        } finally {
          input.removeAttribute("disabled");
          button.removeAttribute("disabled");
          input.focus();
        }
      },
    },
    [h("div", { style: "flex:1;" }, input), button]
  );

  return form;
}
