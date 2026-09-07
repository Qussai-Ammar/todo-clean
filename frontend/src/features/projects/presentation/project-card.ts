import { h } from "../../../shared/dom.js";
import { relativeTime } from "../../../shared/format.js";
import { icon } from "../../../shared/icons.js";
import { Project } from "../domain/project.js";

export function buildProjectCard(project: Project, onOpen: () => void): HTMLElement {
  return h(
    "button",
    { class: "project-card", type: "button", onclick: onOpen },
    [
      h("span", { class: "project-card-icon" }, icon("folder", 18)),
      h("h3", {}, project.name),
      h("p", { class: "project-card-desc" }, project.description || "No description yet"),
      h("div", { class: "project-card-meta" }, [
        h("span", {}, `Updated ${relativeTime(project.updatedAt)}`),
        icon("arrow-right", 14),
      ]),
    ]
  );
}

export function buildNewProjectCard(onClick: () => void): HTMLElement {
  return h("button", { class: "project-card-new", type: "button", onclick: onClick }, [
    icon("plus", 20),
    "New project",
  ]);
}
