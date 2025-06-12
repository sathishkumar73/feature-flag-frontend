import { supabase } from "@/lib/supabaseClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getHeaders(additionalHeaders: Record<string, string> = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { "Content-Type": "application/json", ...additionalHeaders };
  if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;
  return headers;
}

export async function apiGet<T>(endpoint: string, params: Record<string, unknown> = {}) {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  const url = query ? `${API_BASE_URL}${endpoint}?${query}` : `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, { headers: await getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export async function apiPost<T>(endpoint: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export async function apiPut<T>(endpoint: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: await getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export async function apiDelete<T>(endpoint: string) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers: await getHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}
