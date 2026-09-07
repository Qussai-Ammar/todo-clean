import { EntityId } from "../../../shared/domain/entity-id";
import { NotFoundError } from "../../../shared/domain/errors/app-error";
import { ProjectAccessPolicy } from "../../../shared/application/ports/project-access-policy";
import { Task } from "../domain/task.entity";
import { TaskStatus } from "../domain/task-status";
import { TaskRepository } from "../domain/task.repository";

export interface MoveTaskInput {
  status: TaskStatus;
  position: number;
}

/**
 * Moves a task to a (possibly new) status column at a given index, and
 * re-sequences the destination column's positions so list/kanban ordering
 * stays gap-free and consistent for every reader.
 */
export class MoveTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly accessPolicy: ProjectAccessPolicy
  ) {}

  async execute(userId: EntityId, taskId: EntityId, input: MoveTaskInput): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError("Task");
    }

    await this.accessPolicy.assertCanEdit(userId, task.projectId);

    const columnTasks = (await this.taskRepository.findByProject(task.projectId))
      .filter((t) => t.status === input.status && t.id !== task.id)
      .sort((a, b) => a.position - b.position);

    const clampedIndex = Math.max(0, Math.min(input.position, columnTasks.length));
    columnTasks.splice(clampedIndex, 0, task);

    task.moveTo(input.status, clampedIndex);

    await Promise.all(
      columnTasks.map((t, index) => {
        if (t.id !== task.id && t.position !== index) {
          t.moveTo(t.status, index);
        }
        return this.taskRepository.save(t);
      })
    );

    return task;
  }
}
