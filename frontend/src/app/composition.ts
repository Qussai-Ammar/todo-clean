import { DialogManager } from "../shared/dialog.js";
import { HttpClient } from "../shared/http-client.js";
import { Router } from "../shared/router.js";
import { ToastManager } from "../shared/toast.js";
import { createAuthFeature } from "../features/auth/index.js";
import { createCollaborationFeature } from "../features/collaboration/index.js";
import { createProjectsFeature } from "../features/projects/index.js";
import { createTasksFeature } from "../features/tasks/index.js";
import { createViewsFeature } from "../features/views/index.js";
import { ProjectPage, ProjectTab } from "./pages/project-page.js";
import { renderNotFoundPage } from "./pages/not-found-page.js";
import { AppShell } from "./shell.js";

const THEME_KEY = "todo-clean.theme";

export function bootstrap(): void {
  const http = new HttpClient();
  const toast = new ToastManager();
  const dialogs = new DialogManager();
  const router = new Router();
  const navigate = (path: string) => router.navigate(path);

  const auth = createAuthFeature({ http, toast, navigate });

  http.setAuthTokenProvider(() => auth.sessionStore.get()?.token ?? null);
  http.onUnauthorized(() => {
    auth.logoutUseCase.execute();
    router.navigate("/login");
  });

  const shell = new AppShell({
    onNavigateHome: () => router.navigate("/projects"),
    onToggleTheme: () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem(THEME_KEY, next);
      shell.refreshThemeIcon();
    },
    onLogout: () => {
      auth.logoutUseCase.execute();
      toast.info("You've been logged out");
      router.navigate("/login");
    },
  });

  const projects = createProjectsFeature({
    http,
    toast,
    dialogs,
    navigateToProject: (id) => router.navigate(`/projects/${id}/kanban`),
  });

  const tasksController = createTasksFeature({ http, toast, dialogs });
  const viewsController = createViewsFeature({ http, toast, tasksController });
  const membersController = createCollaborationFeature({ http, toast, dialogs });

  const projectPage = new ProjectPage({
    getProjectUseCase: projects.getProjectUseCase,
    projectsController: projects.controller,
    tasksController,
    viewsController,
    membersController,
    currentUserId: () => auth.sessionStore.get()?.user.id ?? "",
    navigate,
    setBreadcrumb: (label) => shell.setBreadcrumb(label),
  });

  function syncUserBadge(): void {
    shell.setUser(auth.sessionStore.get()?.user ?? null);
  }

  function requireAuth(next: () => void): void {
    if (!auth.sessionStore.get()) {
      router.navigate("/login", { replace: true });
      return;
    }
    syncUserBadge();
    shell.showChrome();
    next();
  }

  function requireGuest(next: () => void): void {
    if (auth.sessionStore.get()) {
      router.navigate("/projects", { replace: true });
      return;
    }
    shell.hideChrome();
    shell.setBreadcrumb(null);
    next();
  }

  router
    .add("/", () => router.navigate(auth.sessionStore.get() ? "/projects" : "/login", { replace: true }))
    .add("/login", () => requireGuest(() => auth.controller.renderLogin(shell.main)))
    .add("/register", () => requireGuest(() => auth.controller.renderRegister(shell.main)))
    .add("/verify/:email", (params) =>
      requireGuest(() => auth.controller.renderVerify(shell.main, decodeURIComponent(params.email)))
    )
    .add("/projects", () => requireAuth(() => {
      shell.setBreadcrumb(null);
      void projects.controller.render(shell.main);
    }))
    .add("/projects/:id/:view?", (params) =>
      requireAuth(() => {
        const tab = (params.view as ProjectTab | undefined) ?? "kanban";
        void projectPage.render(shell.main, params.id, tab);
      })
    )
    .notFound(() => renderNotFoundPage(shell.main, () => router.navigate("/projects")));

  router.start();
}
