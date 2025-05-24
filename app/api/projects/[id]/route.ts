import { proxyRequest } from "@/lib/server/api-helpers";
import { getApiBaseUrl, getAuthToken } from "@/lib/server/auth-helpers";
import { NextResponse } from "next/server";

// Get single project by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const apiUrl = getApiBaseUrl();
    const { id } = await params;

    try {
        // Get auth token
        const { token } = await getAuthToken();

        if (!token) {
            return NextResponse.json({ message: "Authentication required" }, { status: 401 });
        }

        // Build the API URL
        const apiUrlWithId = `${apiUrl}/api/projects/${id}`;

        const response = await fetch(apiUrlWithId, {
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
                message = data.message || `Failed to fetch project with ID ${id}`;
            } catch {
                message = `Failed to fetch project with ID ${id}`;
            }

            // Special handling for 404 errors
            if (status === 404) {
                return NextResponse.json({
                    message: "Project not found",
                }, { status: 404 });
            }

            // Special handling for 403 errors
            if (status === 403) {
                return NextResponse.json({
                    message: "You don't have permission to access this project.",
                    roleForbidden: true
                }, { status: 403 });
            }

            return NextResponse.json({ message }, { status });
        }

        // On success, return the API response
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ 
            message: `Failed to fetch project with ID ${id}` 
        }, { status: 500 });
    }
}

// PUT - Update project
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
    return proxyRequest(request, `/api/projects/${id}`, {
        successMessage: "Project updated successfully",
        successStatus: 200
    });
}

// DELETE - Delete project
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
    return proxyRequest(request, `/api/projects/${id}`, {
        successMessage: "Project deleted successfully",
        successStatus: 200
    });
}