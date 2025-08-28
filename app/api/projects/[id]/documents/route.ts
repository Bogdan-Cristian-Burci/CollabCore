import { proxyRequest } from "@/lib/server/api-helpers";
import { NextResponse } from "next/server";

// GET - List documents
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;
        
        return proxyRequest(request, `/api/projects/${id}/documents`, {
            successMessage: "Documents retrieved successfully",
            successStatus: 200
        });
    } catch (error) {
        return NextResponse.json({ 
            message: "Failed to retrieve documents",
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// POST - Upload document
export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;
        
        // Handle multipart/form-data for file uploads
        const formData = await request.formData();
        
        // Extract the file and add it to a new FormData
        const file = formData.get('file') as File;
        if (!file) {
            return NextResponse.json({ 
                message: "No file provided" 
            }, { status: 400 });
        }

        // Create new FormData with proper structure for backend
        const backendFormData = new FormData();
        backendFormData.append('files[]', file);
        backendFormData.append('collection', 'documents');

        // Import auth helpers directly for this special case
        const { getAuthToken, createAuthHeaders, getApiBaseUrl } = await import("@/lib/server/auth-helpers");
        
        const { token, error, status } = await getAuthToken();
        if (error || !token) {
            return NextResponse.json({ message: error || "No authentication token" }, { status: status || 401 });
        }

        const API_URL = getApiBaseUrl();
        const apiUrl = `${API_URL}/api/projects/${id}/documents`;

        // Make direct fetch request with FormData (don't use proxyRequest)
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                // Don't set Content-Type - let browser set multipart/form-data automatically
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: backendFormData
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json({
            message: "Document uploaded successfully",
            ...data
        }, { status: 200 });
        
    } catch (error) {
        console.error('[POST] Error uploading document:', error);
        return NextResponse.json({ 
            message: "Failed to upload document",
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}