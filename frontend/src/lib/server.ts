/**
 * Server-side API client for Next.js
 * Makes requests to the Django backend
 * 
 * Uses API_SERVER_URL (internal Docker network) when running on the server,
 * and NEXT_PUBLIC_API_URL (localhost) when running in the browser.
 */

const API_BASE_URL =
  typeof window === 'undefined'
    ? (process.env.API_SERVER_URL || 'http://api:8000')
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');

const API_PREFIX = '/api/v1';

/**
 * Generic server-side fetch function
 * @param endpoint - API endpoint (e.g., '/pets/?page_size=4')
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Parsed JSON response
 */
export async function serverApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data: T = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    throw error;
  }
}
