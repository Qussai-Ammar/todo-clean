import { CollaboratorRole, Member } from "../../domain/member.js";

export interface CollaborationApi {
  list(projectId: string): Promise<Member[]>;
  invite(projectId: string, email: string, role: CollaboratorRole): Promise<Member>;
  changeRole(projectId: string, userId: string, role: CollaboratorRole): Promise<Member>;
  remove(projectId: string, userId: string): Promise<void>;
}
