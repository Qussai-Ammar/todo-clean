import { Request, Response } from "express";
import { CreateProjectUseCase } from "../application/create-project.usecase";
import { DeleteProjectUseCase } from "../application/delete-project.usecase";
import { GetProjectUseCase } from "../application/get-project.usecase";
import { ListAccessibleProjectsUseCase } from "../application/list-accessible-projects.usecase";
import { UpdateProjectUseCase } from "../application/update-project.usecase";
import { CreateProjectDto, UpdateProjectDto } from "./dtos";
import { toProjectResponse } from "./project.presenter";

export class ProjectController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly listAccessibleProjectsUseCase: ListAccessibleProjectsUseCase,
    private readonly getProjectUseCase: GetProjectUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly deleteProjectUseCase: DeleteProjectUseCase
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as CreateProjectDto;
    const project = await this.createProjectUseCase.execute({ ownerId: req.user!.userId, ...dto });
    res.status(201).json(toProjectResponse(project));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const projects = await this.listAccessibleProjectsUseCase.execute(req.user!.userId);
    res.status(200).json(projects.map(toProjectResponse));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const project = await this.getProjectUseCase.execute(req.user!.userId, req.params.projectId);
    res.status(200).json(toProjectResponse(project));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as UpdateProjectDto;
    const project = await this.updateProjectUseCase.execute(req.user!.userId, req.params.projectId, dto);
    res.status(200).json(toProjectResponse(project));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.deleteProjectUseCase.execute(req.user!.userId, req.params.projectId);
    res.status(204).send();
  };
}
