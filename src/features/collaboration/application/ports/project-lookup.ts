import { EntityId } from "../../../../shared/domain/entity-id";

export interface ProjectRef {
  id: EntityId;
  isOwnedBy(userId: EntityId): boolean;
}

/** Satisfied structurally by the projects feature's ProjectRepository. */
export interface ProjectLookup {
  findById(id: EntityId): Promise<ProjectRef | null>;
}
