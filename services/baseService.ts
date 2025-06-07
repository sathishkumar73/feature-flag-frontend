// services/baseService.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

export abstract class BaseService {
  protected baseUrl = API_BASE_URL;

  protected getHeaders(additionalHeaders: Record<string, string> = {}) {
    return {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
      ...additionalHeaders,
    };
  }

  protected async get<T>(endpoint: string, queryParams: Record<string, any> = {}): Promise<T> {
    const queryString = new URLSearchParams(
      Object.entries(queryParams).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          acc[k] = v.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const url = queryString ? `${this.baseUrl}${endpoint}?${queryString}` : `${this.baseUrl}${endpoint}`;

    const res = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`GET ${endpoint} failed: ${errText}`);
    }
    return res.json();
  }

  protected async post<T>(endpoint: string, data: any): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`POST ${endpoint} failed: ${errText}`);
    }
    return res.json();
  }

  protected async put<T>(endpoint: string, data: any): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`PUT ${endpoint} failed: ${errText}`);
    }
    return res.json();
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`DELETE ${endpoint} failed: ${errText}`);
    }
    return res.json();
  }
}
