import { KanbanColumn, ViewsApi } from "./ports/views-api.js";

export class GetKanbanViewUseCase {
  constructor(private readonly viewsApi: ViewsApi) {}

  execute(projectId: string): Promise<KanbanColumn[]> {
    return this.viewsApi.getKanbanView(projectId);
  }
}
