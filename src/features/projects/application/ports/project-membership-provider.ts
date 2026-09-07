import { EntityId } from "../../../../shared/domain/entity-id";

/**
 * Port implemented (structurally) by the collaboration feature's membership
 * repository. Lets the projects feature list projects a user was invited to
 * without importing anything from the collaboration feature.
 */
export interface ProjectMembershipProvider {
  listProjectIdsForUser(userId: EntityId): Promise<EntityId[]>;
}
