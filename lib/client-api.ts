"use client";

import { useAuthStatus } from "./hooks/useAuthStatus";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useApi() {
  const { accessToken } = useAuthStatus();

  async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`;
    
    // Set up headers
    const headers = new Headers(options.headers || {});
    headers.set("Content-Type", "application/json");
    
    // Add auth token if available
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    const response = await fetch(url, {
      ...options,
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

  return { fetchApi };
}