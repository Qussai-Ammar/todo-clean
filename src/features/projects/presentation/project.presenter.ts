import { Project } from "../domain/project.entity";

export interface ProjectResponse {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export function toProjectResponse(project: Project): ProjectResponse {
  const props = project.toJSON();
  return {
    id: props.id,
    name: props.name,
    description: props.description,
    ownerId: props.ownerId,
    createdAt: props.createdAt.toISOString(),
    updatedAt: props.updatedAt.toISOString(),
  };
}
