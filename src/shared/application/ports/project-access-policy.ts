import { EntityId } from "../../domain/entity-id";

/**
 * Cross-feature authorization port. A project can be viewed/edited either by
 * its owner (projects feature) or by a collaborator (collaboration feature).
 * Each feature depends only on this abstraction; the composition root wires
 * the concrete policy that consults both features' repositories.
 */
export interface ProjectAccessPolicy {
  assertCanView(userId: EntityId, projectId: EntityId): Promise<void>;
  assertCanEdit(userId: EntityId, projectId: EntityId): Promise<void>;
}
