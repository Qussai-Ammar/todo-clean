import { EntityId } from "../../../shared/domain/entity-id";
import { User } from "../domain/user.entity";
import { UserRepository } from "../domain/user.repository";

export class InMemoryUserRepository implements UserRepository {
  private readonly usersById = new Map<EntityId, User>();

  async findById(id: EntityId): Promise<User | null> {
    return this.usersById.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.usersById.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async save(user: User): Promise<void> {
    this.usersById.set(user.id, user);
  }
}
