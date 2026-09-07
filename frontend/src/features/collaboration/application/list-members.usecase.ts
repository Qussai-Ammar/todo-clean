import { Member } from "../domain/member.js";
import { CollaborationApi } from "./ports/collaboration-api.js";

export class ListMembersUseCase {
  constructor(private readonly collaborationApi: CollaborationApi) {}

  execute(projectId: string): Promise<Member[]> {
    return this.collaborationApi.list(projectId);
  }
}
