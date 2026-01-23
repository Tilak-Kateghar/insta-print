const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API_BASE}${path}`, {
    // 🔥 MUST be here, before spread
    credentials: "include",

    // 🔥 headers MUST merge correctly
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },

    ...options, // spread LAST so method/body override safely
  });

  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}: Request failed`;
    try {
      const data = await res.json();
      errorMessage = data.error || data.message || errorMessage;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  // Some endpoints may return empty body (204, logout, etc.)
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}