import { CollaboratorRole, Member } from "../domain/member.js";
import { CollaborationApi } from "./ports/collaboration-api.js";

export class InviteMemberUseCase {
  constructor(private readonly collaborationApi: CollaborationApi) {}

  execute(projectId: string, email: string, role: CollaboratorRole): Promise<Member> {
    return this.collaborationApi.invite(projectId, email, role);
  }
}
