export type RouteParams = Record<string, string>;
export type RouteHandler = (params: RouteParams) => void;

interface Route {
  segments: string[];
  handler: RouteHandler;
}

function parsePath(path: string): string[] {
  return path.split("/").filter(Boolean);
}

function matchRoute(route: Route, pathSegments: string[]): RouteParams | null {
  // A route can never match a path with more segments than it declares —
  // optional segments only ever allow *fewer* path segments, never extra.
  if (pathSegments.length > route.segments.length) return null;

  const params: RouteParams = {};

  for (let i = 0; i < route.segments.length; i++) {
    const segment = route.segments[i];
    const isOptional = segment.endsWith("?");
    const name = segment.replace(/[:?]/g, "");
    const actual = pathSegments[i];

    if (segment.startsWith(":")) {
      if (actual === undefined) {
        if (isOptional) continue;
        return null;
      }
      params[name] = decodeURIComponent(actual);
    } else if (actual !== segment) {
      return null;
    }
  }

  return params;
}

/** Minimal History-API router — enough for a small SPA, no dependencies. */
export class Router {
  private routes: Route[] = [];
  private notFoundHandler: RouteHandler = () => undefined;

  add(pattern: string, handler: RouteHandler): this {
    this.routes.push({ segments: parsePath(pattern), handler });
    return this;
  }

  notFound(handler: RouteHandler): this {
    this.notFoundHandler = handler;
    return this;
  }

  start(): void {
    window.addEventListener("popstate", () => this.resolve());
    document.addEventListener("click", (event) => {
      const anchor = (event.target as Element).closest<HTMLAnchorElement>("a[data-link]");
      if (!anchor) return;
      event.preventDefault();
      this.navigate(anchor.getAttribute("href") ?? "/");
    });
    this.resolve();
  }

  navigate(path: string, options: { replace?: boolean } = {}): void {
    if (options.replace) {
      history.replaceState({}, "", path);
    } else {
      history.pushState({}, "", path);
    }
    this.resolve();
  }

  private resolve(): void {
    const pathSegments = parsePath(window.location.pathname);

    for (const route of this.routes) {
      const params = matchRoute(route, pathSegments);
      if (params) {
        route.handler(params);
        return;
      }
    }

    this.notFoundHandler({});
  }
}
