const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export async function fetchAuditLogs(flagId?: string, page: number = 1, limit: number = 10) {
  const queryParams = new URLSearchParams({
    page: `${page}`,
    limit: `${limit}`,
  });
  
  if (flagId) {
    queryParams.append("flagId", flagId);
  }

  const url = `${API_BASE_URL}/audit-logs${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await fetch(url, {
    headers: { "x-api-key": API_KEY || "" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch audit logs: ${response.status}`);
  }

  return response.json();
}
