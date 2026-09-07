export const COLLABORATOR_ROLES = ["editor", "viewer"] as const;

export type CollaboratorRole = (typeof COLLABORATOR_ROLES)[number];

export function isCollaboratorRole(value: string): value is CollaboratorRole {
  return (COLLABORATOR_ROLES as readonly string[]).includes(value);
}
