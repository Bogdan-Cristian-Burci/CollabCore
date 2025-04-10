import { auth } from "@/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function apiFetch(
  endpoint: string,
  options: FetchOptions = {}
) {
  const url = `${API_URL}${endpoint}`;
  const { token, ...fetchOptions } = options;

  // Set up headers
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  // Add auth token if available
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    // Try to get the session token for server components
    const session = await auth();
    const sessionToken = session?.user?.accessToken;
    
    if (sessionToken) {
      headers.set("Authorization", `Bearer ${sessionToken}`);
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // Handle non-JSON responses
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }
    
    return data;
  }

  if (!response.ok) {
    throw new Error("API request failed");
  }

  return response;
}