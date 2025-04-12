import { auth } from "@/auth";

interface AuthResult {
    token: string | null;
    error: string | null;
    status: number;
}
/**
 * Get authenticated user's access token from the session
 * @returns Object containing token, error message, and status code
 */
export async function getAuthToken(): Promise<AuthResult> {
    const session = await auth();
    const accessToken = session?.user?.accessToken;

    if (!accessToken) {
        return { token: null, error: "Unauthorized", status: 401 };
    }

    return { token: accessToken, error: null, status: 200 };
}

/**
 * Creates standard headers for API requests including authentication
 * @param token The authentication token
 * @returns Object containing the headers
 */
export function createAuthHeaders(token: string) {
    return {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

/**
 * Get the base API URL from environment variables
 * @returns The API URL
 */
export function getApiBaseUrl() {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost";
}

/**
 * Extract error message from Laravel-style error response
 * @param data The response data from Laravel
 * @returns Properly formatted error message
 */
export function extractLaravelErrorMessage(data: any): string {
    // If it's a Laravel exception with a message property
    if (data?.message) {
        // Check if we have specific validation errors
        if (data?.errors && typeof data.errors === 'object') {
            // Get the first error message from the first field
            const firstErrorField = Object.keys(data.errors)[0];
            if (firstErrorField && Array.isArray(data.errors[firstErrorField]) && data.errors[firstErrorField].length > 0) {
                return data.errors[firstErrorField][0];
            }
        }
        // Return the general message if no specific field errors
        return data.message;
    }

    return 'An error occurred';
}