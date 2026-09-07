import { h } from "../../../shared/dom.js";
import type { Task, TaskStatus } from "../../tasks/index.js";
import { TASK_STATUS_LABELS } from "../../tasks/index.js";
import { KanbanColumn } from "../application/ports/views-api.js";

export interface BoardCallbacks {
  onOpenTask(task: Task): void;
  onMove(taskId: string, status: TaskStatus, position: number): Promise<void>;
}

/**
 * Index (excluding the dragged card itself) where a card dropped at
 * clientY `y` should land among `container`'s task cards. Computed only at
 * drop time — the dragged element is never reparented mid-drag, since
 * moving the live drag source during `dragover` can silently cancel the
 * browser's native drag session before `drop` fires.
 */
function getDropIndex(container: HTMLElement, y: number, draggingId: string): number {
  const cards = [...container.querySelectorAll<HTMLElement>(".task-card")].filter(
    (card) => card.dataset.taskId !== draggingId
  );

  for (let i = 0; i < cards.length; i++) {
    const box = cards[i].getBoundingClientRect();
    if (y < box.top + box.height / 2) {
      return i;
    }
  }
  return cards.length;
}

function buildTaskCard(task: Task, callbacks: BoardCallbacks): HTMLElement {
  const card = h(
    "div",
    {
      class: "task-card",
      draggable: "true",
      tabindex: "0",
      role: "button",
      "aria-label": `Open task ${task.title}`,
    },
    [
      h("div", { class: "task-card-title" }, task.title),
      task.description ? h("div", { class: "task-card-desc" }, task.description) : "",
      h("div", { class: "task-card-footer" }, [
        task.assigneeId ? h("span", { class: "avatar" }, task.assigneeId.slice(0, 2).toUpperCase()) : h("span"),
      ]),
    ]
  );

  card.dataset.taskId = task.id;

  card.addEventListener("click", () => callbacks.onOpenTask(task));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      callbacks.onOpenTask(task);
    }
  });

  card.addEventListener("dragstart", (e) => {
    card.classList.add("dragging");
    e.dataTransfer?.setData("text/plain", task.id);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
  });
  card.addEventListener("dragend", () => card.classList.remove("dragging"));

  return card;
}

export function buildKanbanBoard(columns: KanbanColumn[], callbacks: BoardCallbacks): HTMLElement {
  const columnEls = columns.map((column) => {
    const body = h(
      "div",
      { class: "board-column-body" },
      column.tasks.length === 0
        ? h("div", { class: "board-column-empty" }, "Drop tasks here")
        : column.tasks.map((task) => buildTaskCard(task, callbacks))
    );

    const columnEl = h("div", { class: "board-column" }, [
      h("div", { class: "board-column-header" }, [
        h("span", { class: "board-column-title" }, [
          h("span", { class: `board-column-dot dot-${column.status}` }),
          TASK_STATUS_LABELS[column.status],
        ]),
        h("span", { class: "board-column-count" }, String(column.tasks.length)),
      ]),
      body,
    ]);

    columnEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      columnEl.classList.add("drag-over");
    });

    columnEl.addEventListener("dragleave", (e) => {
      if (!columnEl.contains(e.relatedTarget as Node)) {
        columnEl.classList.remove("drag-over");
      }
    });

    columnEl.addEventListener("drop", async (e) => {
      e.preventDefault();
      columnEl.classList.remove("drag-over");
      const taskId = e.dataTransfer?.getData("text/plain");
      if (!taskId) return;

      const position = getDropIndex(body, e.clientY, taskId);
      await callbacks.onMove(taskId, column.status, position);
    });

    return columnEl;
  });

  return h("div", { class: "board" }, columnEls);
}
