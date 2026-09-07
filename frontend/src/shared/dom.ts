export type Children = string | Node | Array<string | Node | null | undefined> | null | undefined;

type Attrs = Record<string, string | number | boolean | undefined | ((event: any) => void)>;

function appendChildren(el: Element, children: Children): void {
  if (children === null || children === undefined) return;
  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    if (child === null || child === undefined) continue;
    el.append(child instanceof Node ? child : document.createTextNode(child));
  }
}

/** Small hyperscript-style element builder — no JSX/build step required. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  children?: Children
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) continue;
    if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === "class") {
      el.className = String(value);
    } else if (key === "html") {
      el.innerHTML = String(value);
    } else if (value === true) {
      el.setAttribute(key, "");
    } else {
      el.setAttribute(key, String(value));
    }
  }

  appendChildren(el, children);
  return el;
}

export function clear(el: Element): void {
  el.replaceChildren();
}

export function mount(parent: Element, ...nodes: Node[]): void {
  parent.append(...nodes);
}

export function fromHtml(svgOrHtml: string): DocumentFragment {
  const template = document.createElement("template");
  template.innerHTML = svgOrHtml.trim();
  return template.content;
}

export function qs<T extends Element = Element>(selector: string, root: ParentNode = document): T | null {
  return root.querySelector<T>(selector);
}
