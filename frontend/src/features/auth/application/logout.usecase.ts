import { SessionStore } from "./ports/session-store.js";

export class LogoutUseCase {
  constructor(private readonly sessionStore: SessionStore) {}

  execute(): void {
    this.sessionStore.clear();
  }
}
