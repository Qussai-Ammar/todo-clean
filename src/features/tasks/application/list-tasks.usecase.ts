import { EntityId } from "../../../shared/domain/entity-id";
import { ProjectAccessPolicy } from "../../../shared/application/ports/project-access-policy";
import { Task } from "../domain/task.entity";
import { TaskRepository } from "../domain/task.repository";

export class ListTasksUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly accessPolicy: ProjectAccessPolicy
  ) {}

  async execute(userId: EntityId, projectId: EntityId): Promise<Task[]> {
    await this.accessPolicy.assertCanView(userId, projectId);
    return this.taskRepository.findByProject(projectId);
  }
}
