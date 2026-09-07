export type CollaboratorRole = "editor" | "viewer";

export interface Member {
  id: string;
  projectId: string;
  userId: string;
  role: CollaboratorRole;
  invitedAt: string;
}
