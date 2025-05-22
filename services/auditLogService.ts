const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export async function fetchAuditLogs(flagId?: string, page: number = 1, limit: number = 10) {
  const queryParams = new URLSearchParams({
    page: `${page}`,
    limit: `${limit}`,
    ...(flagId && { flagId }),
  });

  const response = await fetch(
    `${API_BASE_URL}/audit-logs?${queryParams.toString()}`,
    {
      method: "GET",
      headers: { 
        "x-api-key": API_KEY || "",
        "Content-Type": "application/json"
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch audit logs: ${errorText}`);
  }

  return response.json();
}
