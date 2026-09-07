import { EntityId } from "../../../shared/domain/entity-id";
import { Membership } from "./membership.entity";

export interface MembershipRepository {
  findByProjectAndUser(projectId: EntityId, userId: EntityId): Promise<Membership | null>;
  findByProject(projectId: EntityId): Promise<Membership[]>;
  listProjectIdsForUser(userId: EntityId): Promise<EntityId[]>;
  save(membership: Membership): Promise<void>;
  delete(projectId: EntityId, userId: EntityId): Promise<void>;
}
