import { toast } from "sonner";
import { getSession, signOut } from "next-auth/react";
import { extractLaravelErrorMessage } from "@/lib/server/auth-helpers";

type FetchOptions = RequestInit & {
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
    skipTokenCheck?: boolean; // Option to skip token check (for refresh token requests)
};


export async function fetchWithInterceptor(
    url: string,
    options: FetchOptions = {}
): Promise<Response> {
    const {
        showSuccessToast = true,
        showErrorToast = true,
        successMessage,
        skipTokenCheck = false,
        ...fetchOptions
    } = options;

    const isServerSide = typeof window === 'undefined';
    const isClientSide = !isServerSide;
    try {
        // Determine if this is being called from a Next.js API route itself


        // Special handling for server-side login/register API calls
        let apiUrl;

        if (isServerSide) {
            // On server side, always use external API URL to avoid recursion
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost";
            apiUrl = `${API_URL}${url}`;
            console.log("[Server] Using API URL:", apiUrl);
        } else {
            // On client side, determine if this is a Next.js API route or external
            const isNextApiRoute = url.startsWith('/api/login') || url.startsWith('/api/register');

            if (isNextApiRoute) {
                // Use the Next.js API route directly from client
                apiUrl = url;
                console.log("[Client] Using Next.js API route:", apiUrl);
            } else {
                // Use external API for other endpoints
                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost";
                apiUrl = `${API_URL}${url}`;
                console.log("[Client] Using external API:", apiUrl);
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
                    const tokenExpires = session?.user?.tokenExpires;
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

// Helper methods to make the API easier to use
export const api = {
    get: (url: string, options: FetchOptions = {}) =>
        fetchWithInterceptor(url, { ...options, method: "GET" }),

    post: (url: string, data?: any, options: FetchOptions = {}) =>
        fetchWithInterceptor(url, {
            ...options,
            method: "POST",
            body: data ? JSON.stringify(data) : undefined
        }),

    put: (url: string, data?: any, options: FetchOptions = {}) =>
        fetchWithInterceptor(url, {
            ...options,
            method: "PUT",
            body: data ? JSON.stringify(data) : undefined
        }),

    patch: (url: string, data?: any, options: FetchOptions = {}) =>
        fetchWithInterceptor(url, {
            ...options,
            method: "PATCH",
            body: data ? JSON.stringify(data) : undefined
        }),

    delete: (url: string, options: FetchOptions = {}) =>
        fetchWithInterceptor(url, { ...options, method: "DELETE" }),

    // Helper to automatically parse JSON from the response
    async getJSON<T>(url: string, options: FetchOptions = {}): Promise<T> {
        const response = await fetchWithInterceptor(url, {
            ...options,
            method: "GET",
            showSuccessToast: false
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        return response.json();
    },
};