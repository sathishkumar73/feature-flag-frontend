const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export async function fetchFlags() {
  const response = await fetch(`${API_BASE_URL}/flags`, {
    headers: {
      'x-api-key': API_KEY || '',
    },
  });

  const contentType = response.headers.get('content-type');
  if (!response.ok || !contentType?.includes('application/json')) {
    const errorText = await response.text();
    console.log(errorText)
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}
