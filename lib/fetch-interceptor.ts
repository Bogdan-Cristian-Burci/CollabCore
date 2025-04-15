import { toast } from "sonner";
import { getSession, signOut } from "next-auth/react";
import { extractLaravelErrorMessage } from "@/lib/server/auth-helpers";

export type FetchOptions = RequestInit & {
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
    skipTokenCheck?: boolean; // Option to skip token check (for refresh token requests)
};

/**
 * Enhanced fetch function with authentication, error handling, and toast notifications
 * This is the core fetch utility for all API calls in the application
 */
export async function fetchWithInterceptor(
    url: string,
    options: FetchOptions = {}
): Promise<Response> {
    const {
        showSuccessToast = false, // Changed default to false - let React Query or specific calls enable it when needed
        showErrorToast = true,
        successMessage,
        skipTokenCheck = false,
        ...fetchOptions
    } = options;

    const isServerSide = typeof window === 'undefined';
    const isClientSide = !isServerSide;
    
    try {
        // Determine the API URL based on environment
        let apiUrl;

        if (isServerSide) {
            // On server side, always use external API URL to avoid recursion
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost";
            apiUrl = `${API_URL}${url}`;
        } else {
            // On client side, use Next.js API routes as our API layer
            // This keeps all API calls consistent through our own API routes
            if (url.startsWith('/api/')) {
                apiUrl = url;
            } else {
                // For cases where we might need to call external APIs directly
                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost";
                apiUrl = `${API_URL}${url}`;
            }
        }

        // Set up headers with CSRF protection
        const headers = new Headers(fetchOptions.headers || {});
        headers.set("Content-Type", "application/json");

        // Add CSRF token from meta tag if available (additional CSRF protection)
        if (isClientSide) {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (csrfToken) {
                headers.set("X-CSRF-Token", csrfToken);
            }
        }

        // Add authentication token if not skipping token check
        if (!skipTokenCheck) {
            try {
                // Only try to get a session in client-side context
                if (isClientSide) {
                    const session = await getSession();
                    const accessToken = session?.user?.accessToken;
                    const sessionError = session?.user?.error;

                    // Check for token errors or expiration
                    if (sessionError === "RefreshTokenError") {
                        // Force sign out if refresh token failed
                        await signOut({ redirect: true, callbackUrl: "/login?error=session" });
                        throw new Error("Session expired. Please sign in again.");
                    }

                    // Check if token is valid
                    if (accessToken) {
                        headers.set("Authorization", `Bearer ${accessToken}`);
                    } else {
                        // Handle case where we have no token
                        console.warn("No access token available for API request");
                    }
                }
            } catch (error) {
                console.error("Error getting session:", error);
                // Continue without token if we can't get a session
            }
        }

        const response = await fetch(apiUrl, {
            ...fetchOptions,
            headers,
            // Include credentials for cookies
            credentials: "include"
        });

        // Try to parse the response as JSON to extract any messages
        let responseData;
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            // Clone the response to avoid consuming it
            const clonedResponse = response.clone();
            responseData = await clonedResponse.json();
        }

        // Handle unauthorized responses (could be expired token)
        if (response.status === 401 && !skipTokenCheck && isClientSide) {
            // Token might be expired even though we thought it was valid
            // Force a new auth check and potentially trigger token refresh
            try {
                const newSession = await getSession();

                // If we still have a session but got 401, force refresh
                if (newSession?.user?.accessToken) {
                    // Clear session and redirect to login
                    await signOut({ redirect: true, callbackUrl: "/login?error=unauthorized" });
                }

                if (showErrorToast && isClientSide) {
                    toast.error("Your session has expired. Please sign in again.");
                }
            } catch (error) {
                console.error("Error handling 401 response:", error);
            }
            return response;
        }

        // Handle success responses
        if (response.ok) {
            if (showSuccessToast && isClientSide) {
                const message = successMessage || responseData?.message || "Operation completed successfully";
                toast.success(message);
            }
            return response;
        }
        // Handle other error responses
        else {
            if (showErrorToast && isClientSide) {
                // Extract error message from Laravel-style responses
                const errorMessage = responseData ? extractLaravelErrorMessage(responseData) :
                    response.statusText || "Something went wrong";
                toast.error(errorMessage);
            }
            return response;
        }
    } catch (error) {
        // Handle network/fetch errors
        if (showErrorToast && isClientSide) {
            toast.error(error instanceof Error ? error.message : "Network request failed");
        }
        throw error;
    }
}

/**
 * Parses a JSON response and extracts data according to our API response format
 * Handles multiple response formats: { data: [...] }, [...], or { [resourceName]: [...] }
 */
export async function parseApiResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
    }

    const data = await response.json();
    console.log('Parsing API response:', data);

    // Handle different response formats:
    // 1. { data: [...] } - Standard Laravel API response
    if (data?.data) {
        console.log('Found data in data.data');
        return data.data as T;
    }
    
    // 2. { roles: [...] } or { users: [...] } - Named resource array
    // Look for common resource names
    const commonResourceNames = ['roles', 'users', 'permissions', 'organizations', 'projects', 'teams', 'tasks'];
    for (const resourceName of commonResourceNames) {
        if (data?.[resourceName] && Array.isArray(data[resourceName])) {
            console.log(`Found data in data.${resourceName}`);
            return data[resourceName] as T;
        }
    }
    
    // 3. Directly an array
    if (Array.isArray(data)) {
        console.log('Response is directly an array');
        return data as T;
    }
    
    // 4. Any object with an array property (as a last resort)
    if (data && typeof data === 'object') {
        // First try to find common plural field names that might contain arrays
        const resourceArrayKey = Object.keys(data).find(key => 
            Array.isArray(data[key]) && 
            key.endsWith('s') // Simple heuristic for plural resource names
        );
        
        if (resourceArrayKey) {
            console.log(`Found array in data.${resourceArrayKey}`);
            return data[resourceArrayKey] as T;
        }
        
        // As a fallback, return the object itself
        return data as T;
    }

    // If we can't determine the response format, return the whole thing
    console.log('Using fallback: returning entire response as-is');
    return data as T;
}

// Helper methods to make the API easier to use
export const api = {
    /**
     * Make a GET request
     */
    get: (url: string, options: FetchOptions = {}) =>
        fetchWithInterceptor(url, { ...options, method: "GET" }),

    /**
     * Make a POST request with JSON data
     */
    post: (url: string, data?: any, options: FetchOptions = {}) =>
        fetchWithInterceptor(url, {
            ...options,
            method: "POST",
            body: data ? JSON.stringify(data) : undefined
        }),

    /**
     * Make a PUT request with JSON data
     */
    put: (url: string, data?: any, options: FetchOptions = {}) =>
        fetchWithInterceptor(url, {
            ...options,
            method: "PUT",
            body: data ? JSON.stringify(data) : undefined
        }),

    /**
     * Make a PATCH request with JSON data
     */
    patch: (url: string, data?: any, options: FetchOptions = {}) =>
        fetchWithInterceptor(url, {
            ...options,
            method: "PATCH",
            body: data ? JSON.stringify(data) : undefined
        }),

    /**
     * Make a DELETE request
     */
    delete: (url: string, options: FetchOptions = {}) =>
        fetchWithInterceptor(url, { ...options, method: "DELETE" }),

    /**
     * Make a GET request and automatically parse JSON response
     * For use with React Query queryFn or direct API access
     */
    async getJSON<T>(url: string, options: FetchOptions = {}): Promise<T> {
        const response = await fetchWithInterceptor(url, {
            ...options,
            method: "GET",
            showSuccessToast: false
        });
        
        return parseApiResponse<T>(response);
    },
    
    /**
     * Make a POST request and automatically parse JSON response
     * For use with React Query mutation functions
     */
    async postJSON<T>(url: string, data?: any, options: FetchOptions = {}): Promise<T> {
        const response = await fetchWithInterceptor(url, {
            ...options,
            method: "POST",
            body: data ? JSON.stringify(data) : undefined
        });
        
        return parseApiResponse<T>(response);
    },
    
    /**
     * Make a PUT request and automatically parse JSON response
     * For use with React Query mutation functions
     */
    async putJSON<T>(url: string, data?: any, options: FetchOptions = {}): Promise<T> {
        const response = await fetchWithInterceptor(url, {
            ...options,
            method: "PUT",
            body: data ? JSON.stringify(data) : undefined
        });
        
        return parseApiResponse<T>(response);
    },
    
    /**
     * Make a PATCH request and automatically parse JSON response
     * For use with React Query mutation functions
     */
    async patchJSON<T>(url: string, data?: any, options: FetchOptions = {}): Promise<T> {
        const response = await fetchWithInterceptor(url, {
            ...options,
            method: "PATCH",
            body: data ? JSON.stringify(data) : undefined
        });
        
        return parseApiResponse<T>(response);
    },
    
    /**
     * Make a DELETE request and automatically parse JSON response
     * For use with React Query mutation functions
     */
    async deleteJSON<T>(url: string, options: FetchOptions = {}): Promise<T> {
        const response = await fetchWithInterceptor(url, {
            ...options,
            method: "DELETE"
        });
        
        return parseApiResponse<T>(response);
    }
};