import { DialogManager } from "../../../shared/dialog.js";
import { h } from "../../../shared/dom.js";
import { icon } from "../../../shared/icons.js";
import { ToastManager } from "../../../shared/toast.js";
import { CreateProjectUseCase } from "../application/create-project.usecase.js";
import { DeleteProjectUseCase } from "../application/delete-project.usecase.js";
import { ListProjectsUseCase } from "../application/list-projects.usecase.js";
import { UpdateProjectUseCase } from "../application/update-project.usecase.js";
import { Project } from "../domain/project.js";
import { buildNewProjectCard, buildProjectCard } from "./project-card.js";
import { openProjectFormDialog } from "./project-form-dialog.js";

function buildSkeletonGrid(): HTMLElement {
  const cards = Array.from({ length: 3 }, () =>
    h("div", { class: "project-card", style: "gap:10px;" }, [
      h("div", { class: "skeleton", style: "width:40px;height:40px;border-radius:10px;" }),
      h("div", { class: "skeleton", style: "width:70%;height:16px;" }),
      h("div", { class: "skeleton", style: "width:100%;height:32px;" }),
    ])
  );
  return h("div", { class: "project-grid" }, cards);
}

export class ProjectsController {
  constructor(
    private readonly listProjectsUseCase: ListProjectsUseCase,
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly deleteProjectUseCase: DeleteProjectUseCase,
    private readonly toast: ToastManager,
    private readonly dialogs: DialogManager,
    private readonly navigateToProject: (id: string) => void
  ) {}

  async render(container: HTMLElement): Promise<void> {
    const page = h("div", { class: "page" }, [
      h("div", { class: "page-header" }, [
        h("div", {}, [
          h("h1", { class: "page-title" }, "Your projects"),
          h("p", { class: "page-subtitle" }, "Pick up where you left off, or start something new."),
        ]),
        h(
          "button",
          {
            class: "btn btn-primary",
            onclick: () => this.openCreateDialog(),
          },
          [icon("plus", 16), "New project"]
        ),
      ]),
    ]);

    container.replaceChildren(page);

    const skeleton = buildSkeletonGrid();
    page.appendChild(skeleton);

    try {
      const projects = await this.listProjectsUseCase.execute();
      skeleton.remove();

      if (projects.length === 0) {
        page.appendChild(
          h("div", { class: "empty-state" }, [
            icon("folder", 40),
            h("h3", {}, "No projects yet"),
            h("p", {}, "Create your first project to start organizing tasks with your team."),
            h(
              "button",
              { class: "btn btn-primary", onclick: () => this.openCreateDialog() },
              [icon("plus", 16), "New project"]
            ),
          ])
        );
        return;
      }

      const grid = h("div", { class: "project-grid" }, [
        ...projects.map((project) => buildProjectCard(project, () => this.navigateToProject(project.id))),
        buildNewProjectCard(() => this.openCreateDialog()),
      ]);
      page.appendChild(grid);
    } catch (err) {
      skeleton.remove();
      this.toast.error(err instanceof Error ? err.message : "Could not load projects");
    }
  }

  private openCreateDialog(): void {
    openProjectFormDialog(this.dialogs, {
      mode: "create",
      onSubmit: async (values) => {
        const project = await this.createProjectUseCase.execute(values);
        this.toast.success(`"${project.name}" created`);
        this.navigateToProject(project.id);
      },
    });
  }

  openEditDialog(project: Project, onUpdated: (project: Project) => void): void {
    openProjectFormDialog(this.dialogs, {
      mode: "edit",
      initial: project,
      onSubmit: async (values) => {
        const updated = await this.updateProjectUseCase.execute(project.id, values);
        this.toast.success("Project updated");
        onUpdated(updated);
      },
    });
  }

  async confirmAndDelete(project: Project, onDeleted: () => void): Promise<void> {
    const confirmed = await this.dialogs.confirm({
      title: "Delete this project?",
      message: `"${project.name}" and all of its tasks will be permanently deleted. This can't be undone.`,
      confirmLabel: "Delete project",
      danger: true,
    });
    if (!confirmed) return;

    try {
      await this.deleteProjectUseCase.execute(project.id);
      this.toast.success("Project deleted");
      onDeleted();
    } catch (err) {
      this.toast.error(err instanceof Error ? err.message : "Could not delete project");
    }
  }
}
