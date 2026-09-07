import { Session } from "../domain/session.js";
import { SessionStore } from "../application/ports/session-store.js";

const STORAGE_KEY = "todo-clean.session";

export class LocalStorageSessionStore implements SessionStore {
  get(): Session | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Session;
    } catch {
      return null;
    }
  }

  set(session: Session): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
