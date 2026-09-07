import { EntityId } from "../../../shared/domain/entity-id";
import { Task } from "./task.entity";

export interface TaskRepository {
  findById(id: EntityId): Promise<Task | null>;
  findByProject(projectId: EntityId): Promise<Task[]>;
  countByProjectAndStatus(projectId: EntityId, status: Task["status"]): Promise<number>;
  save(task: Task): Promise<void>;
  delete(id: EntityId): Promise<void>;
}
