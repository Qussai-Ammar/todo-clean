import { EntityId } from "../../../shared/domain/entity-id";
import { ProjectAccessPolicy } from "../../../shared/application/ports/project-access-policy";
import type { Task } from "../../tasks";
import { TASK_STATUSES } from "../../tasks/domain/task-status";
import { TaskReader } from "./ports/task-reader";

const STATUS_ORDER = new Map(TASK_STATUSES.map((status, index) => [status, index]));

export class GetListViewUseCase {
  constructor(
    private readonly taskReader: TaskReader,
    private readonly accessPolicy: ProjectAccessPolicy
  ) {}

  async execute(userId: EntityId, projectId: EntityId): Promise<Task[]> {
    await this.accessPolicy.assertCanView(userId, projectId);

    const tasks = await this.taskReader.findByProject(projectId);
    return [...tasks].sort((a, b) => {
      const statusDiff = STATUS_ORDER.get(a.status)! - STATUS_ORDER.get(b.status)!;
      return statusDiff !== 0 ? statusDiff : a.position - b.position;
    });
  }
}
