export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4001/api/v1";

export async function postJson<T>(url: string, body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || "Request failed");
  }

  return json as T;
}

export async function fetchJson<T>(url: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });
  const json = await response.json();
  
  if (!response.ok) {
    throw new Error(json.error || "Request failed");
  }

  return json as T;
}
