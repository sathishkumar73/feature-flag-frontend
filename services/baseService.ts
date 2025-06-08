import { supabase } from "@/lib/supabaseClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

export abstract class BaseService {
  protected baseUrl = API_BASE_URL;

  /**
   * Get headers with dynamic Authorization Bearer JWT token if available
   */
  protected async getHeaders(additionalHeaders: Record<string, string> = {}) {
    // Try to get session and JWT token from Supabase client
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...additionalHeaders,
    };

    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    return headers;
  }

  /**
   * GET request
   */
  protected async get<T>(
    endpoint: string,
    queryParams: Record<string, any> = {}
  ): Promise<T> {
    const queryString = new URLSearchParams(
      Object.entries(queryParams).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          acc[k] = v.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const url = queryString
      ? `${this.baseUrl}${endpoint}?${queryString}`
      : `${this.baseUrl}${endpoint}`;

    const headers = await this.getHeaders();

    const res = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`GET ${endpoint} failed: ${errText}`);
    }
    return res.json();
  }

  /**
   * POST request
   */
  protected async post<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getHeaders();

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`POST ${endpoint} failed: ${errText}`);
    }
    return res.json();
  }

  /**
   * PUT request
   */
  protected async put<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getHeaders();

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`PUT ${endpoint} failed: ${errText}`);
    }
    return res.json();
  }

  /**
   * DELETE request
   */
  protected async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getHeaders();

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`DELETE ${endpoint} failed: ${errText}`);
    }
    return res.json();
  }
}
