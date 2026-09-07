import { v4 as uuidv4 } from "uuid";

export type EntityId = string;

export function generateId(): EntityId {
  return uuidv4();
}
