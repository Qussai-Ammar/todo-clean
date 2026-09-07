import { Children, h } from "../../shared/dom.js";
import { icon } from "../../shared/icons.js";
import { GetProjectUseCase, Project, ProjectsController } from "../../features/projects/index.js";
import { TasksController } from "../../features/tasks/index.js";
import { ViewsController } from "../../features/views/index.js";
import { MembersController } from "../../features/collaboration/index.js";

export type ProjectTab = "kanban" | "list" | "members";

export interface ProjectPageDeps {
  getProjectUseCase: GetProjectUseCase;
  projectsController: ProjectsController;
  tasksController: TasksController;
  viewsController: ViewsController;
  membersController: MembersController;
  currentUserId: () => string;
  navigate: (path: string) => void;
  setBreadcrumb: (label: string | null) => void;
}

export class ProjectPage {
  constructor(private readonly deps: ProjectPageDeps) {}

  async render(container: HTMLElement, projectId: string, tab: ProjectTab): Promise<void> {
    container.replaceChildren(
      h("div", { class: "page" }, [
        h("div", { class: "skeleton", style: "height:32px; width:240px; margin-bottom:12px;" }),
        h("div", { class: "skeleton", style: "height:16px; width:360px; margin-bottom:28px;" }),
        h("div", { class: "skeleton", style: "height:200px; border-radius:14px;" }),
      ])
    );

    let project: Project;
    try {
      project = await this.deps.getProjectUseCase.execute(projectId);
    } catch (err) {
      container.replaceChildren(
        h("div", { class: "page" }, [
          h("div", { class: "empty-state" }, [
            icon("alert-circle", 40),
            h("h3", {}, "Couldn't load this project"),
            h("p", {}, err instanceof Error ? err.message : "It may have been deleted, or you lost access."),
            h(
              "button",
              { class: "btn btn-secondary", onclick: () => this.deps.navigate("/projects") },
              "Back to projects"
            ),
          ]),
        ])
      );
      return;
    }

    this.deps.setBreadcrumb(project.name);
    this.renderShell(container, project, tab);
  }

  private renderShell(container: HTMLElement, project: Project, tab: ProjectTab): void {
    const isOwner = project.ownerId === this.deps.currentUserId();
    const contentEl = h("div", {});

    const tabs = h("div", { class: "segmented", role: "tablist" }, [
      this.tabButton("kanban", tab, project.id, [icon("kanban", 15), "Kanban"]),
      this.tabButton("list", tab, project.id, [icon("list", 15), "List"]),
      this.tabButton("members", tab, project.id, [icon("users", 15), "Members"]),
    ]);

    const menuButton = h(
      "button",
      { class: "btn btn-ghost btn-icon", "aria-label": "Project options", onclick: (e: Event) => this.openProjectMenu(e, project, container, tab) },
      icon("more-horizontal", 18)
    );

    const page = h("div", { class: "page" }, [
      h("div", { class: "page-header" }, [
        h("div", {}, [
          h("h1", { class: "page-title" }, project.name),
          project.description ? h("p", { class: "page-subtitle" }, project.description) : "",
        ]),
        h("div", { class: "page-actions" }, [tabs, isOwner ? menuButton : ""]),
      ]),
      contentEl,
    ]);

    container.replaceChildren(page);

    if (tab === "kanban") {
      void this.deps.viewsController.renderKanban(contentEl, project.id);
      contentEl.before(this.deps.tasksController.buildQuickAddForm(project.id, () => this.deps.viewsController.renderKanban(contentEl, project.id)));
    } else if (tab === "list") {
      void this.deps.viewsController.renderList(contentEl, project.id);
      contentEl.before(this.deps.tasksController.buildQuickAddForm(project.id, () => this.deps.viewsController.renderList(contentEl, project.id)));
    } else {
      void this.deps.membersController.render(contentEl, project.id, {
        isOwner,
        currentUserId: this.deps.currentUserId(),
        onSelfLeft: () => this.deps.navigate("/projects"),
      });
    }
  }

  private tabButton(value: ProjectTab, active: ProjectTab, projectId: string, children: Children): HTMLElement {
    return h(
      "button",
      {
        class: `segmented-item ${value === active ? "active" : ""}`,
        role: "tab",
        onclick: () => this.deps.navigate(`/projects/${projectId}/${value}`),
      },
      children
    );
  }

  private openProjectMenu(e: Event, project: Project, container: HTMLElement, tab: ProjectTab): void {
    e.stopPropagation();
    document.querySelector(".menu")?.remove();
    const trigger = e.currentTarget as HTMLElement;
    const rect = trigger.getBoundingClientRect();

    const close = () => menu.remove();
    const menu = h(
      "div",
      { class: "menu", style: `top:${rect.bottom + 6}px; right:${window.innerWidth - rect.right}px;` },
      [
        h(
          "button",
          {
            class: "menu-item",
            onclick: () => {
              close();
              this.deps.projectsController.openEditDialog(project, () => this.render(container, project.id, tab));
            },
          },
          [icon("edit", 15), "Edit project"]
        ),
        h(
          "button",
          {
            class: "menu-item danger",
            onclick: () => {
              close();
              void this.deps.projectsController.confirmAndDelete(project, () => this.deps.navigate("/projects"));
            },
          },
          [icon("trash", 15), "Delete project"]
        ),
      ]
    );

    document.body.appendChild(menu);
    setTimeout(() => document.addEventListener("click", close, { once: true }));
  }
}
