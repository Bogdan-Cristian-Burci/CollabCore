import { proxyRequest } from "@/lib/server/api-helpers";
import { getApiBaseUrl, getAuthToken } from "@/lib/server/auth-helpers";
import { NextResponse } from "next/server";
// Get all projects
export async function GET(request: Request){
    // Get the API base URL and add detailed debugging
    const apiUrl = getApiBaseUrl();
    
    // Parse query parameters for pagination
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const per_page = url.searchParams.get('per_page') || '10';

    try {
        // Get auth token with detailed logging
        const { token, status, error } = await getAuthToken();

        if (!token) {
            return NextResponse.json({ message: "Authentication required" }, { status: 401 });
        }

        // Build the API URL with pagination parameters
        const apiUrlWithParams = new URL(`${apiUrl}/api/projects`);
        apiUrlWithParams.searchParams.append('page', page);
        apiUrlWithParams.searchParams.append('per_page', per_page);

        const response = await fetch(apiUrlWithParams, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            const status = response.status;
            const text = await response.text();

            let message;
            try {
                const data = JSON.parse(text);
                message = data.message || "Failed to fetch projects";
            } catch {
                message = "Failed to fetch projects";
            }

            // Special handling for 403 errors
            if (status === 403) {
                // Create a more user-friendly error message
                return NextResponse.json({
                    message: "You don't have permission to access project list.",
                    rolesForbidden: true
                }, { status: 403 });
            }

            return NextResponse.json({ message }, { status });
        }

        // On success, return the API response
        const data = await response.json();

        // Don't modify the response structure - return it exactly as received
        // This ensures the client receives the same data format as your Postman request

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ message: "Failed to fetch projects" }, { status: 500 });
    }
}

// POST - Create new project
export async function POST(request: Request) {
    return proxyRequest(request, "/api/projects", { // PLURAL as confirmed multiple times
        successMessage: "Project created successfully",
        successStatus: 201
    });
}