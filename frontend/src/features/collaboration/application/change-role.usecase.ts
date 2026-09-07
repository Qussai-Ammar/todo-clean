import { CollaboratorRole, Member } from "../domain/member.js";
import { CollaborationApi } from "./ports/collaboration-api.js";

export class ChangeRoleUseCase {
  constructor(private readonly collaborationApi: CollaborationApi) {}

  execute(projectId: string, userId: string, role: CollaboratorRole): Promise<Member> {
    return this.collaborationApi.changeRole(projectId, userId, role);
  }
}
