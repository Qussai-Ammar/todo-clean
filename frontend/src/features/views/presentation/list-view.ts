import { h } from "../../../shared/dom.js";
import { icon } from "../../../shared/icons.js";
import type { Task, TaskStatus } from "../../tasks/index.js";
import { TASK_STATUSES, TASK_STATUS_LABELS } from "../../tasks/index.js";

export interface ListCallbacks {
  onOpenTask(task: Task): void;
  onToggleDone(task: Task): Promise<void>;
  onChangeStatus(task: Task, status: TaskStatus): Promise<void>;
  onDelete(task: Task): Promise<void>;
}

function buildRow(task: Task, callbacks: ListCallbacks): HTMLElement {
  const isDone = task.status === "done";

  const check = h(
    "button",
    {
      class: `task-row-check ${isDone ? "checked" : ""}`,
      type: "button",
      "aria-label": isDone ? "Mark as not done" : "Mark as done",
      onclick: (e: Event) => {
        e.stopPropagation();
        void callbacks.onToggleDone(task);
      },
    },
    isDone ? icon("check-circle", 13) : ""
  );

  const select = h(
    "select",
    {
      class: "select",
      "aria-label": "Task status",
      onclick: (e: Event) => e.stopPropagation(),
      onchange: (e: Event) => {
        void callbacks.onChangeStatus(task, (e.target as HTMLSelectElement).value as TaskStatus);
      },
    },
    TASK_STATUSES.map((status) =>
      h("option", { value: status, selected: status === task.status }, TASK_STATUS_LABELS[status])
    )
  );

  const deleteButton = h(
    "button",
    {
      class: "btn btn-ghost btn-icon",
      "aria-label": "Delete task",
      onclick: (e: Event) => {
        e.stopPropagation();
        void callbacks.onDelete(task);
      },
    },
    icon("trash", 15)
  );

  return h("div", { class: `task-row ${isDone ? "is-done" : ""}`, onclick: () => callbacks.onOpenTask(task) }, [
    check,
    h("div", { class: "task-row-main" }, [
      h("div", { class: "task-row-title" }, task.title),
      task.description ? h("div", { class: "task-row-desc" }, task.description) : "",
    ]),
    h("div", { class: "task-row-actions" }, [select, deleteButton]),
  ]);
}

export function buildListView(tasks: Task[], callbacks: ListCallbacks): HTMLElement {
  if (tasks.length === 0) {
    return h("div", { class: "empty-state" }, [
      icon("list", 40),
      h("h3", {}, "No tasks yet"),
      h("p", {}, "Add your first task using the field above."),
    ]);
  }

  return h(
    "div",
    { class: "task-list" },
    tasks.map((task) => buildRow(task, callbacks))
  );
}
