import { CollaborationApi } from "./ports/collaboration-api.js";

export class RemoveMemberUseCase {
  constructor(private readonly collaborationApi: CollaborationApi) {}

  execute(projectId: string, userId: string): Promise<void> {
    return this.collaborationApi.remove(projectId, userId);
  }
}
