import { NextResponse } from "next/server";
import {
    getAuthToken,
    createAuthHeaders,
    getApiBaseUrl,
    extractLaravelErrorMessage
} from "./auth-helpers";

type ApiOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
    customErrorMessage?: string;
    successMessage?: string;
    successStatus?: number;
};

/**
 * Makes an authenticated API request and handles common response patterns
 * specifically for Next.js API routes
 */
export async function makeServerApiRequest(
    endpoint: string,
    options: ApiOptions = {}
) {
    const {
        method = 'GET',
        body = undefined,
        customErrorMessage,
        successMessage,
        successStatus = 200
    } = options;

    try {
        // Get auth token
        const { token, error, status } = await getAuthToken();

        if (error || !token) {
            return NextResponse.json({ message: error || "No authentication token" }, { status: status || 401 });
        }

        // Build the full URL
        const API_URL = getApiBaseUrl();
        const apiUrl = `${API_URL}${endpoint}`;

        console.log(`API Route: ${method} request to:`, apiUrl);

        // Build request options
        const fetchOptions: RequestInit = {
            method,
            headers: createAuthHeaders(token),
        };

        // Add body if provided
        if (body) {
            fetchOptions.body = JSON.stringify(body);
        }

        // Make the request
        const response = await fetch(apiUrl, fetchOptions);

        // Handle no content response
        if (response.status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        // Try to parse JSON if available
        const contentType = response.headers.get("content-type");
        let data: any = {};

        if (contentType && contentType.includes("application/json")) {
            data = await response.json().catch(() => ({}));
        }

        // Handle error response
        if (!response.ok) {
            console.error(`Failed API request to ${endpoint}, status:`, response.status);

            // Extract Laravel-specific error message
            const errorMessage = extractLaravelErrorMessage(data) || customErrorMessage || "Operation failed";

            return NextResponse.json(
                {
                    message: errorMessage,
                    ...(data.exception ? { details: data } : {}) // Include full error details for debugging
                },
                { status: response.status }
            );
        }

        // For success response, include the success message if provided
        if (successMessage && data) {
            if (typeof data === 'object') {
                data.message = successMessage;
            }
        }

        // Return successful response
        return NextResponse.json(data, { status: successStatus });

    } catch (error) {
        console.error(`Error in API request to ${endpoint}:`, error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}

/**
 * Proxy a request from Next.js API route to external API with authentication
 */
export async function proxyRequest(
    request: Request,
    endpoint: string,
    options: Omit<ApiOptions, 'body'> = {}
) {
    const { method = request.method as any } = options;

    try {
        // For GET requests, we don't need to parse the body
        if (method === 'GET') {
            return makeServerApiRequest(endpoint, options);
        }

        // For other methods, parse the request body if present
        let body = undefined;
        const contentType = request.headers.get('content-type');

        if (contentType?.includes('application/json')) {
            body = await request.json().catch(() => undefined);
        }

        return makeServerApiRequest(endpoint, {
            ...options,
            method,
            body,
        });
    } catch (error) {
        console.error(`Error proxying request to ${endpoint}:`, error);
        return NextResponse.json(
            { message: "Failed to process request" },
            { status: 500 }
        );
    }
}