const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const isFormData = options.body instanceof FormData;

  try {
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
      let errorMessage = `HTTP ${res.status}: Request failed`;
      try {
        const data = await res.json();
        errorMessage = data.error || data.message || errorMessage;
      } catch (parseError) {
        // If JSON parsing fails, use default error message
        console.warn('Failed to parse error response as JSON:', parseError);
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error or unexpected failure');
  }
}
