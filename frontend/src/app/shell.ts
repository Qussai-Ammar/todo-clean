import { h } from "../shared/dom.js";
import { initials } from "../shared/format.js";
import { icon } from "../shared/icons.js";
import { AuthUser } from "../features/auth/index.js";

export interface ShellCallbacks {
  onNavigateHome(): void;
  onToggleTheme(): void;
  onLogout(): void;
}

export class AppShell {
  private readonly root: HTMLElement;
  private readonly topbar: HTMLElement;
  private readonly breadcrumbEl: HTMLElement;
  private readonly userMenuTrigger: HTMLElement;
  private readonly themeToggle: HTMLElement;
  private readonly mainEl: HTMLElement;
  private menuOpen = false;

  constructor(private readonly callbacks: ShellCallbacks) {
    this.breadcrumbEl = h("div", { class: "breadcrumb" });

    this.themeToggle = h(
      "button",
      { class: "btn btn-ghost btn-icon", "aria-label": "Toggle theme", onclick: () => callbacks.onToggleTheme() },
      icon(this.isDark() ? "sun" : "moon", 17)
    );

    this.userMenuTrigger = h(
      "button",
      { class: "user-menu-trigger", onclick: (e: Event) => this.toggleMenu(e) },
      [h("span", { class: "avatar" }, "?"), icon("chevron-down", 14)]
    );

    this.topbar = h("header", { class: "topbar" }, [
      h("div", { class: "topbar-left" }, [
        h(
          "a",
          { class: "brand", href: "/projects", "data-link": true, onclick: () => callbacks.onNavigateHome() },
          [h("span", { class: "brand-mark" }, icon("sparkles", 16)), "Todo Clean"]
        ),
        this.breadcrumbEl,
      ]),
      h("div", { class: "topbar-right" }, [this.themeToggle, this.userMenuTrigger]),
    ]);

    this.mainEl = h("main", { id: "app-main" });

    this.root = h("div", { id: "app-shell" }, [this.topbar, this.mainEl]);
    document.body.appendChild(this.root);

    document.addEventListener("click", () => this.closeMenu());
  }

  private isDark(): boolean {
    const stored = localStorage.getItem("todo-clean.theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  private toggleMenu(e: Event): void {
    e.stopPropagation();
    this.menuOpen = !this.menuOpen;
    this.renderMenu();
  }

  private closeMenu(): void {
    if (!this.menuOpen) return;
    this.menuOpen = false;
    document.querySelector(".menu")?.remove();
  }

  private renderMenu(): void {
    document.querySelector(".menu")?.remove();
    if (!this.menuOpen) return;

    const rect = this.userMenuTrigger.getBoundingClientRect();
    const menu = h(
      "div",
      { class: "menu", style: `top:${rect.bottom + 8}px; right:${window.innerWidth - rect.right}px;` },
      [
        h(
          "button",
          {
            class: "menu-item danger",
            onclick: () => {
              this.closeMenu();
              this.callbacks.onLogout();
            },
          },
          [icon("logout", 15), "Log out"]
        ),
      ]
    );
    document.body.appendChild(menu);
  }

  refreshThemeIcon(): void {
    this.themeToggle.replaceChildren(icon(this.isDark() ? "sun" : "moon", 17));
  }

  setUser(user: AuthUser | null): void {
    const avatar = this.userMenuTrigger.querySelector(".avatar");
    if (avatar) avatar.textContent = user ? initials(user.name) : "?";
    this.userMenuTrigger.setAttribute("data-tooltip", user?.name ?? "");
  }

  showChrome(): void {
    this.topbar.style.display = "flex";
  }

  hideChrome(): void {
    this.topbar.style.display = "none";
  }

  setBreadcrumb(label: string | null): void {
    if (!label) {
      this.breadcrumbEl.replaceChildren();
      return;
    }
    this.breadcrumbEl.replaceChildren(
      icon("chevron-right", 14),
      h("span", { class: "breadcrumb-current" }, label)
    );
  }

  get main(): HTMLElement {
    return this.mainEl;
  }
}
