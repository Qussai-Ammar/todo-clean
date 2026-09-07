import type { Task } from "../../tasks/index.js";
import { ViewsApi } from "./ports/views-api.js";

export class GetListViewUseCase {
  constructor(private readonly viewsApi: ViewsApi) {}

  execute(projectId: string): Promise<Task[]> {
    return this.viewsApi.getListView(projectId);
  }
}
