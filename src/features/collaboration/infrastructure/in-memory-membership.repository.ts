import { EntityId } from "../../../shared/domain/entity-id";
import { Membership } from "../domain/membership.entity";
import { MembershipRepository } from "../domain/membership.repository";

function key(projectId: EntityId, userId: EntityId): string {
  return `${projectId}:${userId}`;
}

export class InMemoryMembershipRepository implements MembershipRepository {
  private readonly membershipsByKey = new Map<string, Membership>();

  async findByProjectAndUser(projectId: EntityId, userId: EntityId): Promise<Membership | null> {
    return this.membershipsByKey.get(key(projectId, userId)) ?? null;
  }

  async findByProject(projectId: EntityId): Promise<Membership[]> {
    return [...this.membershipsByKey.values()].filter((m) => m.projectId === projectId);
  }

  async listProjectIdsForUser(userId: EntityId): Promise<EntityId[]> {
    return [...this.membershipsByKey.values()].filter((m) => m.userId === userId).map((m) => m.projectId);
  }

  async save(membership: Membership): Promise<void> {
    this.membershipsByKey.set(key(membership.projectId, membership.userId), membership);
  }

  async delete(projectId: EntityId, userId: EntityId): Promise<void> {
    this.membershipsByKey.delete(key(projectId, userId));
  }
}
