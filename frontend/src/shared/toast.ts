import { h } from "./dom.js";
import { icon, IconName } from "./icons.js";

export type ToastVariant = "success" | "error" | "info";

const ICONS: Record<ToastVariant, IconName> = {
  success: "check-circle",
  error: "alert-circle",
  info: "info",
};

export class ToastManager {
  private viewport: HTMLElement;

  constructor() {
    this.viewport = h("div", { class: "toast-viewport", role: "status", "aria-live": "polite" });
    document.body.appendChild(this.viewport);
  }

  show(message: string, variant: ToastVariant = "info", durationMs = 4200): void {
    const toast = h("div", { class: "toast" }, [
      h("span", { class: `toast-icon ${variant}` }, icon(ICONS[variant], 18)),
      h("div", { class: "toast-body" }, message),
      h(
        "button",
        {
          class: "toast-close",
          "aria-label": "Dismiss",
          onclick: () => remove(),
        },
        icon("x", 14)
      ),
    ]);

    const remove = () => {
      toast.classList.add("leaving");
      setTimeout(() => toast.remove(), 220);
    };

    this.viewport.appendChild(toast);
    setTimeout(remove, durationMs);
  }

  success(message: string): void {
    this.show(message, "success");
  }

  error(message: string): void {
    this.show(message, "error");
  }

  info(message: string): void {
    this.show(message, "info");
  }
}
