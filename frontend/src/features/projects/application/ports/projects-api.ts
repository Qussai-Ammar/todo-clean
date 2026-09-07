import { Project } from "../../domain/project.js";

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
}

export interface ProjectsApi {
  list(): Promise<Project[]>;
  get(id: string): Promise<Project>;
  create(input: CreateProjectInput): Promise<Project>;
  update(id: string, input: UpdateProjectInput): Promise<Project>;
  remove(id: string): Promise<void>;
}
