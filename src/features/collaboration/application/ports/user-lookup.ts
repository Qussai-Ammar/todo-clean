import { EntityId } from "../../../../shared/domain/entity-id";

export interface UserRef {
  id: EntityId;
  email: string;
}

/** Satisfied structurally by the auth feature's UserRepository. */
export interface UserLookup {
  findByEmail(email: string): Promise<UserRef | null>;
}
