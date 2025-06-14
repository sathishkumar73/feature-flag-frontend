import { supabase } from "@/lib/supabaseClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getHeaders(additionalHeaders: Record<string, string> = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { "Content-Type": "application/json", ...additionalHeaders };
  if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;
  return headers;
}

export function parseErrorResponse(res: Response, body: string): Error {
  try {
    const json = JSON.parse(body);
    if (json && typeof json.error === 'string') {
      const err = new Error(json.error);
      // @ts-expect-error: attach status if present
      if (json.status) err.status = json.status;
      return err;
    }
    // fallback: show first string property if present
    for (const key in json) {
      if (typeof json[key] === 'string') return new Error(json[key]);
    }
  } catch {}
  return new Error(body || `HTTP error ${res.status}`);
}

// --- Interceptor Types ---
type RequestInterceptor = (input: RequestInfo, init: RequestInit) => Promise<{ input: RequestInfo; init: RequestInit }> | { input: RequestInfo; init: RequestInit };
type ResponseInterceptor = (response: Response) => Promise<Response> | Response;

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];

export function addRequestInterceptor(interceptor: RequestInterceptor) {
  requestInterceptors.push(interceptor);
}
export function addResponseInterceptor(interceptor: ResponseInterceptor) {
  responseInterceptors.push(interceptor);
}

// --- Internal fetch with interceptors and abort support ---
async function interceptedFetch(input: RequestInfo, init: RequestInit): Promise<Response> {
  let req = { input, init };
  for (const interceptor of requestInterceptors) {
    req = await interceptor(req.input, req.init);
  }
  let res = await fetch(req.input, req.init);
  for (const interceptor of responseInterceptors) {
    res = await interceptor(res);
  }
  return res;
}

// --- API Methods ---
export async function apiGet<T>(endpoint: string, params: Record<string, unknown> = {}, options?: { signal?: AbortSignal }) {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  const url = query ? `${API_BASE_URL}${endpoint}?${query}` : `${API_BASE_URL}${endpoint}`;
  const headers = await getHeaders();
  const res = await interceptedFetch(url, { headers, signal: options?.signal });
  if (!res.ok) throw parseErrorResponse(res, await res.text());
  return res.json() as Promise<T>;
}

export async function apiPost<T>(endpoint: string, data: Record<string, unknown>, options?: { signal?: AbortSignal }) {
  const headers = await getHeaders();
  const res = await interceptedFetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
    signal: options?.signal,
  });
  if (!res.ok) throw parseErrorResponse(res, await res.text());
  return res.json() as Promise<T>;
}

export async function apiPut<T>(endpoint: string, data: Record<string, unknown>, options?: { signal?: AbortSignal }) {
  const headers = await getHeaders();
  const res = await interceptedFetch(`${API_BASE_URL}${endpoint}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
    signal: options?.signal,
  });
  if (!res.ok) throw parseErrorResponse(res, await res.text());
  return res.json() as Promise<T>;
}

export async function apiDelete<T>(endpoint: string, options?: { signal?: AbortSignal }) {
  const headers = await getHeaders();
  const res = await interceptedFetch(`${API_BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers,
    signal: options?.signal,
  });
  if (!res.ok) throw parseErrorResponse(res, await res.text());
  return res.json() as Promise<T>;
}

addRequestInterceptor(async (input, init) => {
  const url = typeof input === "string" ? input : input.url;
  if (
    url.includes("/flags") ||
    url.includes("/audit-logs") ||
    url.includes("/api-keys")
  ) {
    console.log(`[API Request] ${init.method || "GET"} ${url}`);
  }
  return { input, init };
});

// Response interceptor: log status for relevant API calls
addResponseInterceptor(async (response) => {
  if (
    response.url.includes("/flags") ||
    response.url.includes("/audit-logs") ||
    response.url.includes("/api-keys")
  ) {
    console.log(`[API Response] ${response.status} ${response.url}`);
  }
  return response;
});

