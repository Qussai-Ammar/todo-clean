import { HttpClient } from "../../../shared/http-client.js";
import type { Task } from "../../tasks/index.js";
import { KanbanColumn, ViewsApi } from "../application/ports/views-api.js";

interface ListViewResponse {
  tasks: Task[];
}

interface KanbanViewResponse {
  columns: KanbanColumn[];
}

export class HttpViewsApi implements ViewsApi {
  constructor(private readonly http: HttpClient) {}

  async getListView(projectId: string): Promise<Task[]> {
    const res = await this.http.get<ListViewResponse>(`/views/${projectId}/list`);
    return res.tasks;
  }

  async getKanbanView(projectId: string): Promise<KanbanColumn[]> {
    const res = await this.http.get<KanbanViewResponse>(`/views/${projectId}/kanban`);
    return res.columns;
  }
}
