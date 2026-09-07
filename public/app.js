(() => {
  "use strict";

  const STATUSES = ["todo", "in_progress", "done"];
  const STATUS_LABELS = { todo: "To do", in_progress: "In progress", done: "Done" };

  const state = {
    token: localStorage.getItem("token"),
    user: JSON.parse(localStorage.getItem("user") || "null"),
    route: { name: "projects" },
  };

  function saveAuth(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    state.token = token;
    state.user = user;
  }

  function clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    state.token = null;
    state.user = null;
  }

  async function api(path, { method = "GET", body } = {}) {
    const res = await fetch(`/api${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (res.status === 204) return null;

    let data = null;
    try {
      data = await res.json();
    } catch {
      /* empty body */
    }

    if (!res.ok) {
      if (res.status === 401) {
        clearAuth();
        render();
      }
      throw new Error(data?.error?.message || res.statusText);
    }

    return data;
  }

  const app = document.getElementById("app");

  function updateUserBox() {
    const userBox = document.getElementById("userBox");
    const userName = document.getElementById("userName");
    if (state.user) {
      userBox.classList.remove("hidden");
      userName.textContent = state.user.name;
    } else {
      userBox.classList.add("hidden");
    }
  }

  document.getElementById("logoutBtn").addEventListener("click", () => {
    clearAuth();
    state.route = { name: "projects" };
    render();
  });

  function render() {
    updateUserBox();
    app.innerHTML = "";

    if (!state.token) {
      renderAuthView();
      return;
    }

    if (state.route.name === "project") {
      renderProjectDetailView(state.route.id, state.route.view || "kanban");
    } else {
      renderProjectsView();
    }
  }

  // ---------- Auth ----------

  function renderAuthView() {
    const tpl = document.getElementById("tpl-auth").content.cloneNode(true);
    app.appendChild(tpl);

    const tabs = app.querySelectorAll(".tab-btn");
    const loginForm = app.querySelector("#loginForm");
    const registerForm = app.querySelector("#registerForm");

    tabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        tabs.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const isLogin = btn.dataset.tab === "login";
        loginForm.classList.toggle("hidden", !isLogin);
        registerForm.classList.toggle("hidden", isLogin);
      });
    });

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const errorEl = app.querySelector('[data-error="login"]');
      errorEl.textContent = "";
      const form = new FormData(loginForm);
      try {
        const result = await api("/auth/login", {
          method: "POST",
          body: { email: form.get("email"), password: form.get("password") },
        });
        saveAuth(result.token, result.user);
        state.route = { name: "projects" };
        render();
      } catch (err) {
        errorEl.textContent = err.message;
      }
    });

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const errorEl = app.querySelector('[data-error="register"]');
      errorEl.textContent = "";
      const form = new FormData(registerForm);
      try {
        const result = await api("/auth/register", {
          method: "POST",
          body: {
            name: form.get("name"),
            email: form.get("email"),
            password: form.get("password"),
          },
        });
        saveAuth(result.token, result.user);
        state.route = { name: "projects" };
        render();
      } catch (err) {
        errorEl.textContent = err.message;
      }
    });
  }

  // ---------- Projects list ----------

  async function renderProjectsView() {
    const tpl = document.getElementById("tpl-projects").content.cloneNode(true);
    app.appendChild(tpl);

    const form = app.querySelector("#newProjectForm");
    const list = app.querySelector("#projectList");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = data.get("name").trim();
      if (!name) return;
      await api("/projects", {
        method: "POST",
        body: { name, description: data.get("description") || "" },
      });
      form.reset();
      loadProjects();
    });

    async function loadProjects() {
      list.innerHTML = '<p class="muted">Loading…</p>';
      try {
        const projects = await api("/projects");
        list.innerHTML = "";
        if (projects.length === 0) {
          list.innerHTML = '<p class="muted">No projects yet. Create your first one above.</p>';
          return;
        }
        projects.forEach((project) => {
          const card = document.createElement("div");
          card.className = "project-card";
          card.innerHTML = `
            <h3></h3>
            <p></p>
          `;
          card.querySelector("h3").textContent = project.name;
          card.querySelector("p").textContent = project.description || "No description";
          card.addEventListener("click", () => {
            state.route = { name: "project", id: project.id, view: "kanban" };
            render();
          });
          list.appendChild(card);
        });
      } catch (err) {
        list.innerHTML = `<p class="error">${err.message}</p>`;
      }
    }

    loadProjects();
  }

  // ---------- Project detail ----------

  async function renderProjectDetailView(projectId, view) {
    const tpl = document.getElementById("tpl-project-detail").content.cloneNode(true);
    app.appendChild(tpl);

    app.querySelector("#backBtn").addEventListener("click", () => {
      state.route = { name: "projects" };
      render();
    });

    const viewButtons = app.querySelectorAll(".view-toggle .tab-btn");
    viewButtons.forEach((btn) => {
      if (btn.dataset.view === view) btn.classList.add("active");
      else btn.classList.remove("active");
      btn.addEventListener("click", () => {
        state.route = { name: "project", id: projectId, view: btn.dataset.view };
        render();
      });
    });

    const newTaskForm = app.querySelector("#newTaskForm");
    newTaskForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(newTaskForm);
      const title = data.get("title").trim();
      if (!title) return;
      try {
        await api("/tasks", { method: "POST", body: { projectId, title } });
        newTaskForm.reset();
        loadViewContent();
      } catch (err) {
        alert(err.message);
      }
    });

    let project;
    try {
      project = await api(`/projects/${projectId}`);
    } catch (err) {
      app.querySelector(".project-detail").innerHTML = `<p class="error">${err.message}</p>`;
      return;
    }

    app.querySelector("#projectName").textContent = project.name;
    app.querySelector("#projectDescription").textContent = project.description || "";

    const isOwner = project.ownerId === state.user.id;
    const container = app.querySelector("#viewContainer");

    async function loadViewContent() {
      container.innerHTML = '<p class="muted">Loading…</p>';
      try {
        if (view === "kanban") {
          const data = await api(`/views/${projectId}/kanban`);
          renderKanban(container, data.columns, projectId, loadViewContent);
        } else if (view === "list") {
          const data = await api(`/views/${projectId}/list`);
          renderList(container, data.tasks, projectId, loadViewContent);
        } else if (view === "members") {
          const members = await api(`/projects/${projectId}/members`);
          renderMembers(container, members, projectId, isOwner, state.user.id, loadViewContent);
        }
      } catch (err) {
        container.innerHTML = `<p class="error">${err.message}</p>`;
      }
    }

    loadViewContent();
  }

  function renderKanban(container, columns, projectId, refresh) {
    container.innerHTML = "";
    const board = document.createElement("div");
    board.className = "kanban-board";

    columns.forEach((column) => {
      const col = document.createElement("div");
      col.className = "kanban-column";
      col.innerHTML = `<h4>${STATUS_LABELS[column.status]} (${column.tasks.length})</h4>`;

      column.tasks.forEach((task) => {
        col.appendChild(buildTaskCard(task, projectId, refresh));
      });

      board.appendChild(col);
    });

    container.appendChild(board);
  }

  function buildTaskCard(task, projectId, refresh) {
    const card = document.createElement("div");
    card.className = "task-card";

    const statusIndex = STATUSES.indexOf(task.status);
    const canMoveLeft = statusIndex > 0;
    const canMoveRight = statusIndex < STATUSES.length - 1;

    card.innerHTML = `
      <div class="task-title"></div>
      <div class="task-actions">
        <button class="btn btn-ghost btn-small" data-action="left" ${canMoveLeft ? "" : "disabled"}>&larr;</button>
        <button class="btn btn-ghost btn-small" data-action="right" ${canMoveRight ? "" : "disabled"}>&rarr;</button>
        <button class="btn btn-danger btn-small" data-action="delete">Delete</button>
      </div>
    `;
    card.querySelector(".task-title").textContent = task.title;

    card.querySelector('[data-action="left"]')?.addEventListener("click", async () => {
      await moveTask(task.id, STATUSES[statusIndex - 1], refresh);
    });
    card.querySelector('[data-action="right"]')?.addEventListener("click", async () => {
      await moveTask(task.id, STATUSES[statusIndex + 1], refresh);
    });
    card.querySelector('[data-action="delete"]').addEventListener("click", async () => {
      await deleteTask(task.id, refresh);
    });

    return card;
  }

  async function moveTask(taskId, status, refresh) {
    try {
      await api(`/tasks/${taskId}/move`, { method: "PATCH", body: { status, position: 0 } });
      refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteTask(taskId, refresh) {
    try {
      await api(`/tasks/${taskId}`, { method: "DELETE" });
      refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  function renderList(container, tasks, projectId, refresh) {
    container.innerHTML = "";
    if (tasks.length === 0) {
      container.innerHTML = '<p class="muted">No tasks yet.</p>';
      return;
    }

    tasks.forEach((task) => {
      const row = document.createElement("div");
      row.className = "task-list-row";
      row.innerHTML = `
        <div>
          <span></span>
          <span class="status-badge"></span>
        </div>
        <div class="task-actions">
          <select></select>
          <button class="btn btn-danger btn-small" data-action="delete">Delete</button>
        </div>
      `;
      row.querySelector("div span").textContent = task.title;
      row.querySelector(".status-badge").textContent = STATUS_LABELS[task.status];

      const select = row.querySelector("select");
      STATUSES.forEach((status) => {
        const opt = document.createElement("option");
        opt.value = status;
        opt.textContent = STATUS_LABELS[status];
        if (status === task.status) opt.selected = true;
        select.appendChild(opt);
      });
      select.addEventListener("change", () => moveTask(task.id, select.value, refresh));

      row.querySelector('[data-action="delete"]').addEventListener("click", () => deleteTask(task.id, refresh));

      container.appendChild(row);
    });
  }

  function renderMembers(container, members, projectId, isOwner, currentUserId, refresh) {
    container.innerHTML = "";

    if (isOwner) {
      const inviteForm = document.createElement("form");
      inviteForm.className = "inline-form";
      inviteForm.innerHTML = `
        <input type="email" name="email" placeholder="Collaborator email" required />
        <select name="role">
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
        </select>
        <button type="submit" class="btn btn-primary">Invite</button>
      `;
      inviteForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = new FormData(inviteForm);
        try {
          await api(`/projects/${projectId}/members`, {
            method: "POST",
            body: { email: data.get("email"), role: data.get("role") },
          });
          inviteForm.reset();
          refresh();
        } catch (err) {
          alert(err.message);
        }
      });
      container.appendChild(inviteForm);
    }

    if (members.length === 0) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "No collaborators yet.";
      container.appendChild(empty);
      return;
    }

    members.forEach((member) => {
      const row = document.createElement("div");
      row.className = "member-row";
      const isSelf = member.userId === currentUserId;

      row.innerHTML = `
        <span></span>
        <div class="task-actions">
          ${isOwner ? `<select><option value="viewer">Viewer</option><option value="editor">Editor</option></select>` : ""}
          ${isOwner || isSelf ? `<button class="btn btn-danger btn-small" data-action="remove">${isSelf ? "Leave" : "Remove"}</button>` : ""}
        </div>
      `;
      row.querySelector("span").textContent = `User ${member.userId.slice(0, 8)}`;

      const select = row.querySelector("select");
      if (select) {
        select.value = member.role;
        select.addEventListener("change", async () => {
          try {
            await api(`/projects/${projectId}/members/${member.userId}`, {
              method: "PATCH",
              body: { role: select.value },
            });
            refresh();
          } catch (err) {
            alert(err.message);
          }
        });
      }

      row.querySelector('[data-action="remove"]')?.addEventListener("click", async () => {
        try {
          await api(`/projects/${projectId}/members/${member.userId}`, { method: "DELETE" });
          refresh();
        } catch (err) {
          alert(err.message);
        }
      });

      container.appendChild(row);
    });
  }

  render();
})();
