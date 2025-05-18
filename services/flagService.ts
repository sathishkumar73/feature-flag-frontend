const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export async function fetchFlags(
  page = 1,
  limit = 10,
  environment = "all",
  sortOrder = "createdAt_desc"
) {
  const [sortField, sortDirection] = sortOrder.split("_");

  const queryParams = new URLSearchParams({
    page: `${page}`,
    limit: `${limit}`,
    ...(environment !== "all" && { environment }),
    sort: sortField,
    order: sortDirection,
  });

  const response = await fetch(
    `${API_BASE_URL}/flags?${queryParams.toString()}`,
    {
      headers: { "x-api-key": API_KEY || "" },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch flags");
  return response.json();
}

export async function createFlag(data: {
  name: string;
  description: string;
  environment: string;
  enabled: boolean;
  rolloutPercentage?: number;
}) {
  const response = await fetch(`${API_BASE_URL}/flags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY || "",
    },
    body: JSON.stringify({
      ...data,
      rolloutPercentage: data.rolloutPercentage ?? 0, // Default to 0 if not provided
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create flag: ${errorText}`);
  }

  return response.json();
}

export async function updateFlag(
  id: string,
  data: {
    name: string;
    description: string;
    environment: string;
    enabled: boolean;
    rolloutPercentage?: number;
  }
) {
  const response = await fetch(`${API_BASE_URL}/flags/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY || "",
    },
    body: JSON.stringify({
      ...data,
      rolloutPercentage: data.rolloutPercentage ?? 0,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update flag: ${errorText}`);
  }

  return response.json();
}

export async function deleteFlag(id: string) {
  const response = await fetch(`${API_BASE_URL}/flags/${id}`, {
    method: "DELETE",
    headers: {
      "x-api-key": API_KEY || "",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete flag: ${errorText}`);
  }

  return { success: true };
}
