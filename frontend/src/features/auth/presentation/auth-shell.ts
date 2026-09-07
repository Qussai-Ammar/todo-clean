import { h } from "../../../shared/dom.js";
import { icon } from "../../../shared/icons.js";

export interface AuthShellOptions {
  heading: string;
  subheading: string;
  body: Node;
  footer?: Node;
}

export function renderAuthShell(container: HTMLElement, options: AuthShellOptions): void {
  container.replaceChildren(
    h("div", { class: "auth-shell" }, [
      h("div", { class: "auth-showcase" }, [
        h("div", { class: "auth-showcase-glow" }),
        h("div", { class: "auth-showcase-content" }, [
          icon("sparkles", 32),
          h("h2", { style: "margin-top: 20px" }, "Plan the work. See it move."),
          h(
            "p",
            {},
            "Organize projects into boards or lists, invite your team, and watch tasks flow from to-do to done — all in one clean, fast workspace."
          ),
        ]),
      ]),
      h("div", { class: "auth-form-wrap" }, [
        h("div", { class: "brand" }, [
          h("span", { class: "brand-mark" }, icon("sparkles", 16)),
          "Todo Clean",
        ]),
        h("div", { class: "auth-heading" }, [h("h1", {}, options.heading), h("p", {}, options.subheading)]),
        options.body,
        options.footer ?? "",
      ]),
    ])
  );
}
