/**
 * Temel HTTP istemcisi — tüm API çağrıları buradan geçer.
 *
 * Backend henüz hazır değil; bu katman API_SPEC.md'deki Spring Boot REST
 * uçlarına bire bir karşılık gelecek şekilde hazırlandı. Gerçek sunucu
 * ayağa kalktığında sadece VITE_API_BASE_URL ortam değişkenini ayarlamak
 * yeterli olacak.
 */

/** `.env` → VITE_API_BASE_URL (örn. https://api.example.com/api/v1). */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string | undefined,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** JWT vb. token'ı buraya bağlayacağız (şimdilik localStorage'dan okunuyor). */
function authHeader(): Record<string, string> {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface RequestOptions {
  /**
   * Query string parametreleri — düz bir nesne; undefined/null/"" değerler
   * otomatik atlanır, geri kalanı String'e çevrilir. Tipli filtre arayüzleri
   * (AssignmentFilters vb.) index-signature gerektirmeden buraya verilebilsin
   * diye `object` kullanıldı.
   */
  params?: object;
  /** İstek gövdesi (JSON'a çevrilir). */
  body?: unknown;
  signal?: AbortSignal;
}

function buildUrl(path: string, params?: object): string {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const res = await fetch(buildUrl(path, options.params), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  if (!res.ok) {
    // API_SPEC.md §7 — standart hata gövdesi
    let code: string | undefined;
    let message = res.statusText;
    try {
      const err = await res.json();
      code = err.code;
      message = err.message ?? message;
    } catch {
      /* gövde JSON değilse statusText ile yetin */
    }
    throw new ApiError(res.status, code, message);
  }

  // 204 No Content → gövde yok
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>("DELETE", path, options),
};

/** Bir Blob döndüren uçlar için (örn. Excel dışa aktarım). */
export async function downloadBlob(
  path: string,
  params?: RequestOptions["params"]
): Promise<Blob> {
  const res = await fetch(buildUrl(path, params), { headers: authHeader() });
  if (!res.ok) throw new ApiError(res.status, undefined, res.statusText);
  return res.blob();
}
