const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export async function fetchFlags(page = 1, limit = 10, environment = 'all', sortOrder = 'createdAt_desc') {
  const [sortField, sortDirection] = sortOrder.split('_');

  const queryParams = new URLSearchParams({
    page: `${page}`,
    limit: `${limit}`,
    ...(environment !== 'all' && { environment }),
    sort: sortField,
    order: sortDirection,
  });

  const response = await fetch(`${API_BASE_URL}/flags?${queryParams.toString()}`, {
    headers: { 'x-api-key': API_KEY || '' },
  });

  if (!response.ok) throw new Error('Failed to fetch flags');
  return response.json();
}

