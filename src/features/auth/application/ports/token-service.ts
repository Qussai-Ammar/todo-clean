import { EntityId } from "../../../../shared/domain/entity-id";

export interface AuthTokenPayload {
  userId: EntityId;
  email: string;
}

export interface TokenService {
  sign(payload: AuthTokenPayload): string;
  verify(token: string): AuthTokenPayload;
}
