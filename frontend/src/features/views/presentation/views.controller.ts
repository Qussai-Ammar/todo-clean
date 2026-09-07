import { h } from "../../../shared/dom.js";
import { ToastManager } from "../../../shared/toast.js";
import { TasksController } from "../../tasks/index.js";
import { GetKanbanViewUseCase } from "../application/get-kanban-view.usecase.js";
import { GetListViewUseCase } from "../application/get-list-view.usecase.js";
import { buildKanbanBoard } from "./kanban-board.js";
import { buildListView } from "./list-view.js";

function buildSkeletonBoard(): HTMLElement {
  return h(
    "div",
    { class: "board" },
    Array.from({ length: 3 }, () =>
      h("div", { class: "board-column" }, [
        h("div", { class: "skeleton", style: "height:16px; width:60%; margin: 8px 0 16px;" }),
        h("div", { class: "skeleton", style: "height:64px; margin-bottom:8px; border-radius:10px;" }),
        h("div", { class: "skeleton", style: "height:64px; border-radius:10px;" }),
      ])
    )
  );
}

export class ViewsController {
  constructor(
    private readonly getListViewUseCase: GetListViewUseCase,
    private readonly getKanbanViewUseCase: GetKanbanViewUseCase,
    private readonly tasksController: TasksController,
    private readonly toast: ToastManager
  ) {}

  async renderKanban(container: HTMLElement, projectId: string): Promise<void> {
    const skeleton = buildSkeletonBoard();
    container.replaceChildren(skeleton);

    try {
      const columns = await this.getKanbanViewUseCase.execute(projectId);
      const board = buildKanbanBoard(columns, {
        onOpenTask: (task) =>
          this.tasksController.openDetail(
            task,
            () => void this.renderKanban(container, projectId),
            () => void this.renderKanban(container, projectId)
          ),
        onMove: async (taskId, status, position) => {
          try {
            await this.tasksController.move(taskId, { status, position });
          } catch (err) {
            this.toast.error(err instanceof Error ? err.message : "Could not move task");
          } finally {
            await this.renderKanban(container, projectId);
          }
        },
      });
      container.replaceChildren(board);
    } catch (err) {
      this.toast.error(err instanceof Error ? err.message : "Could not load the board");
      container.replaceChildren();
    }
  }

  async renderList(container: HTMLElement, projectId: string): Promise<void> {
    container.replaceChildren(
      h(
        "div",
        { class: "task-list" },
        Array.from({ length: 4 }, () => h("div", { class: "skeleton", style: "height:52px; border-radius:10px;" }))
      )
    );

    try {
      const tasks = await this.getListViewUseCase.execute(projectId);
      const list = buildListView(tasks, {
        onOpenTask: (task) =>
          this.tasksController.openDetail(
            task,
            () => void this.renderList(container, projectId),
            () => void this.renderList(container, projectId)
          ),
        onToggleDone: async (task) => {
          await this.tasksController.move(task.id, {
            status: task.status === "done" ? "todo" : "done",
            position: 0,
          });
          await this.renderList(container, projectId);
        },
        onChangeStatus: async (task, status) => {
          await this.tasksController.move(task.id, { status, position: 0 });
          await this.renderList(container, projectId);
        },
        onDelete: async (task) => {
          const confirmed = await this.tasksController.confirmDelete(task);
          if (!confirmed) return;
          await this.tasksController.deleteQuiet(task.id);
          await this.renderList(container, projectId);
        },
      });
      container.replaceChildren(list);
    } catch (err) {
      this.toast.error(err instanceof Error ? err.message : "Could not load tasks");
      container.replaceChildren();
    }
  }
}
