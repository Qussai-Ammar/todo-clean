import { HttpClient } from "../../../shared/http-client.js";
import { Project } from "../domain/project.js";
import { CreateProjectInput, ProjectsApi, UpdateProjectInput } from "../application/ports/projects-api.js";

export class HttpProjectsApi implements ProjectsApi {
  constructor(private readonly http: HttpClient) {}

  list(): Promise<Project[]> {
    return this.http.get<Project[]>("/projects");
  }

  get(id: string): Promise<Project> {
    return this.http.get<Project>(`/projects/${id}`);
  }

  create(input: CreateProjectInput): Promise<Project> {
    return this.http.post<Project>("/projects", input);
  }

  update(id: string, input: UpdateProjectInput): Promise<Project> {
    return this.http.patch<Project>(`/projects/${id}`, input);
  }

  remove(id: string): Promise<void> {
    return this.http.delete<void>(`/projects/${id}`);
  }
}
