export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}

/**
 * Thin fetch wrapper shared by every feature's infrastructure layer. Holds
 * no feature-specific knowledge — auth attaches its token via
 * `setAuthTokenProvider`, and any 401 response notifies a single listener
 * so the auth feature can react (e.g. sign the user out) without this
 * client importing anything from that feature.
 */
export class HttpClient {
  private tokenProvider: () => string | null = () => null;
  private unauthorizedListener: (() => void) | null = null;

  constructor(private readonly baseUrl = "/api") {}

  setAuthTokenProvider(provider: () => string | null): void {
    this.tokenProvider = provider;
  }

  onUnauthorized(listener: () => void): void {
    this.unauthorizedListener = listener;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const token = this.tokenProvider();

    const res = await fetch(`${this.baseUrl}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    if (res.status === 204) {
      return undefined as T;
    }

    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      /* no body */
    }

    if (!res.ok) {
      if (res.status === 401) {
        this.unauthorizedListener?.();
      }
      const error = (data ?? {}) as { error?: { message?: string; code?: string } };
      throw new ApiError(
        error.error?.message ?? res.statusText,
        res.status,
        error.error?.code ?? "UNKNOWN_ERROR"
      );
    }

    return data as T;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "POST", body });
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "PATCH", body });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }
}
