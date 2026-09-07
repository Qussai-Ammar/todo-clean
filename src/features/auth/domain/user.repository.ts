import { EntityId } from "../../../shared/domain/entity-id";
import { User } from "./user.entity";

export interface UserRepository {
  findById(id: EntityId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
