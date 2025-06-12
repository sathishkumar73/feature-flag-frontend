import { supabase } from "@/lib/supabaseClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getHeaders(additionalHeaders: Record<string, string> = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { "Content-Type": "application/json", ...additionalHeaders };
  if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;
  return headers;
}

function parseErrorResponse(res: Response, body: string): Error {
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

export async function apiGet<T>(endpoint: string, params: Record<string, unknown> = {}) {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  const url = query ? `${API_BASE_URL}${endpoint}?${query}` : `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, { headers: await getHeaders() });
  if (!res.ok) throw parseErrorResponse(res, await res.text());
  return res.json() as Promise<T>;
}

export async function apiPost<T>(endpoint: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw parseErrorResponse(res, await res.text());
  return res.json() as Promise<T>;
}

export async function apiPut<T>(endpoint: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: await getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw parseErrorResponse(res, await res.text());
  return res.json() as Promise<T>;
}

export async function apiDelete<T>(endpoint: string) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers: await getHeaders(),
  });
  if (!res.ok) throw parseErrorResponse(res, await res.text());
  return res.json() as Promise<T>;
}
