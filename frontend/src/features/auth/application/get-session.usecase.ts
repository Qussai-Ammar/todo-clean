import { Session } from "../domain/session.js";
import { SessionStore } from "./ports/session-store.js";

export class GetSessionUseCase {
  constructor(private readonly sessionStore: SessionStore) {}

  execute(): Session | null {
    return this.sessionStore.get();
  }
}
