import { Session } from "../../domain/session.js";

export interface SessionStore {
  get(): Session | null;
  set(session: Session): void;
  clear(): void;
}
