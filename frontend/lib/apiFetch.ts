const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const isFormData = options.body instanceof FormData;
  
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: isFormData 
      ? {} 
      : {
          "Content-Type": "application/json",
          ...options.headers,
        },
    ...options,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${res.status}: Request failed`);
  }

  return res.json();
}