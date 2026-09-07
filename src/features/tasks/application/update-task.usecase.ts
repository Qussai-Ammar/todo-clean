import { EntityId } from "../../../shared/domain/entity-id";
import { NotFoundError, ValidationError } from "../../../shared/domain/errors/app-error";
import { ProjectAccessPolicy } from "../../../shared/application/ports/project-access-policy";
import { Task } from "../domain/task.entity";
import { TaskRepository } from "../domain/task.repository";

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  assigneeId?: EntityId | null;
}

export class UpdateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly accessPolicy: ProjectAccessPolicy
  ) {}

  async execute(userId: EntityId, taskId: EntityId, input: UpdateTaskInput): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError("Task");
    }

    await this.accessPolicy.assertCanEdit(userId, task.projectId);

    if (input.title !== undefined && !input.title.trim()) {
      throw new ValidationError("Task title cannot be empty");
    }

    task.updateDetails({
      title: input.title?.trim(),
      description: input.description?.trim(),
      assigneeId: input.assigneeId,
    });

    await this.taskRepository.save(task);
    return task;
  }
}
