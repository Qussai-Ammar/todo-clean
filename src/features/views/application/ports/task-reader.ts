import { EntityId } from "../../../../shared/domain/entity-id";
import type { Task } from "../../../tasks";

/**
 * Port satisfied structurally by the tasks feature's TaskRepository. Views
 * only ever reads tasks to build a projection; it never writes to them.
 */
export interface TaskReader {
  findByProject(projectId: EntityId): Promise<Task[]>;
}
