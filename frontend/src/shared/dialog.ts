import { h } from "./dom.js";

export interface DialogAction {
  label: string;
  variant?: "primary" | "secondary" | "danger";
  onClick: () => void | Promise<void>;
  closeOnClick?: boolean;
}

export interface DialogOptions {
  title: string;
  body: Node | string;
  actions?: DialogAction[];
  onDismiss?: () => void;
}

export class DialogManager {
  open(options: DialogOptions): () => void {
    const backdrop = h("div", { class: "dialog-backdrop" });
    const dialog = h("div", { class: "dialog", role: "dialog", "aria-modal": "true" });

    let dismissed = true;
    const close = () => {
      document.removeEventListener("keydown", onKeydown);
      backdrop.remove();
      if (dismissed) options.onDismiss?.();
    };

    const runAction = (action: DialogAction) => async () => {
      dismissed = false;
      await action.onClick();
      dismissed = true;
      if (action.closeOnClick !== false) close();
    };

    const actionButtons = (options.actions ?? []).map((action) =>
      h(
        "button",
        {
          class: `btn ${action.variant === "danger" ? "btn-danger" : action.variant === "secondary" ? "btn-secondary" : "btn-primary"}`,
          onclick: runAction(action),
        },
        action.label
      )
    );

    dialog.append(
      h("div", { class: "dialog-header" }, [
        h("h3", { class: "dialog-title" }, options.title),
        h("button", { class: "btn btn-ghost btn-icon", "aria-label": "Close", onclick: close }, "✕"),
      ]),
      options.body,
      actionButtons.length ? h("div", { class: "dialog-actions" }, actionButtons) : ""
    );

    backdrop.appendChild(dialog);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) close();
    });

    function onKeydown(e: KeyboardEvent): void {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeydown);

    document.body.appendChild(backdrop);
    dialog.querySelector<HTMLElement>("input, textarea, select, button")?.focus();

    return close;
  }

  confirm(options: { title: string; message: string; confirmLabel?: string; danger?: boolean }): Promise<boolean> {
    return new Promise((resolve) => {
      let settled = false;
      const settle = (value: boolean) => {
        if (settled) return;
        settled = true;
        resolve(value);
      };

      this.open({
        title: options.title,
        body: h("p", { style: "color: var(--text-secondary); font-size: var(--text-sm)" }, options.message),
        onDismiss: () => settle(false),
        actions: [
          { label: "Cancel", variant: "secondary", onClick: () => settle(false) },
          {
            label: options.confirmLabel ?? "Confirm",
            variant: options.danger ? "danger" : "primary",
            onClick: () => settle(true),
          },
        ],
      });
    });
  }
}
