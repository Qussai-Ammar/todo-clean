import { EntityId } from "../../../shared/domain/entity-id";
import { ProjectAccessPolicy } from "../../../shared/application/ports/project-access-policy";
import type { Task, TaskStatus } from "../../tasks";
import { TASK_STATUSES } from "../../tasks/domain/task-status";
import { TaskReader } from "./ports/task-reader";

export interface KanbanColumn {
  status: TaskStatus;
  tasks: Task[];
}

export class GetKanbanViewUseCase {
  constructor(
    private readonly taskReader: TaskReader,
    private readonly accessPolicy: ProjectAccessPolicy
  ) {}

  async execute(userId: EntityId, projectId: EntityId): Promise<KanbanColumn[]> {
    await this.accessPolicy.assertCanView(userId, projectId);

    const tasks = await this.taskReader.findByProject(projectId);

    return TASK_STATUSES.map((status) => ({
      status,
      tasks: tasks
        .filter((task) => task.status === status)
        .sort((a, b) => a.position - b.position),
    }));
  }
}
