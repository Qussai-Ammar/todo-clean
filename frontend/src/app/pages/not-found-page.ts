import { h } from "../../shared/dom.js";
import { icon } from "../../shared/icons.js";

export function renderNotFoundPage(container: HTMLElement, onGoHome: () => void): void {
  container.replaceChildren(
    h("div", { class: "page" }, [
      h("div", { class: "empty-state" }, [
        icon("search", 40),
        h("h3", {}, "Page not found"),
        h("p", {}, "The page you're looking for doesn't exist."),
        h("button", { class: "btn btn-primary", onclick: onGoHome }, "Go to your projects"),
      ]),
    ])
  );
}
