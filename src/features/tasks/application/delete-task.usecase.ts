import { EntityId } from "../../../shared/domain/entity-id";
import { NotFoundError } from "../../../shared/domain/errors/app-error";
import { ProjectAccessPolicy } from "../../../shared/application/ports/project-access-policy";
import { TaskRepository } from "../domain/task.repository";

export class DeleteTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly accessPolicy: ProjectAccessPolicy
  ) {}

  async execute(userId: EntityId, taskId: EntityId): Promise<void> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError("Task");
    }

    await this.accessPolicy.assertCanEdit(userId, task.projectId);
    await this.taskRepository.delete(taskId);
  }
}
