import { DialogManager } from "../../../shared/dialog.js";
import { ToastManager } from "../../../shared/toast.js";
import { CreateTaskUseCase } from "../application/create-task.usecase.js";
import { DeleteTaskUseCase } from "../application/delete-task.usecase.js";
import { MoveTaskUseCase } from "../application/move-task.usecase.js";
import { UpdateTaskUseCase } from "../application/update-task.usecase.js";
import { MoveTaskInput } from "../application/ports/tasks-api.js";
import { Task } from "../domain/task.js";
import { buildNewTaskForm } from "./new-task-form.js";
import { openTaskDetailDialog } from "./task-detail-dialog.js";

/**
 * Orchestrates task mutations for whichever presentation is currently
 * showing them (the views feature's kanban board or list). Keeping this in
 * the tasks feature — rather than in views — mirrors the backend, where
 * only the tasks feature can write; views only ever reads.
 */
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly moveTaskUseCase: MoveTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
    private readonly toast: ToastManager,
    private readonly dialogs: DialogManager
  ) {}

  buildQuickAddForm(projectId: string, onCreated: (task: Task) => void): HTMLElement {
    return buildNewTaskForm(async (title) => {
      const task = await this.createTaskUseCase.execute({ projectId, title });
      onCreated(task);
    });
  }

  openDetail(task: Task, onUpdated: (task: Task) => void, onDeleted: () => void): void {
    openTaskDetailDialog(this.dialogs, task, {
      onSave: async (fields) => {
        const updated = await this.updateTaskUseCase.execute(task.id, fields);
        this.toast.success("Task updated");
        onUpdated(updated);
      },
      onDelete: async () => {
        await this.deleteTaskUseCase.execute(task.id);
        this.toast.success("Task deleted");
        onDeleted();
      },
    });
  }

  async move(taskId: string, input: MoveTaskInput): Promise<Task> {
    return this.moveTaskUseCase.execute(taskId, input);
  }

  async deleteQuiet(taskId: string): Promise<void> {
    await this.deleteTaskUseCase.execute(taskId);
    this.toast.success("Task deleted");
  }

  confirmDelete(task: Task): Promise<boolean> {
    return this.dialogs.confirm({
      title: "Delete this task?",
      message: `"${task.title}" will be permanently removed.`,
      confirmLabel: "Delete task",
      danger: true,
    });
  }
}
