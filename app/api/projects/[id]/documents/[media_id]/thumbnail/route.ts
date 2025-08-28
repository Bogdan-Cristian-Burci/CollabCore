import { getApiBaseUrl, getAuthToken } from "@/lib/server/auth-helpers";
import { NextResponse } from "next/server";

// Get document thumbnail with proper authentication
export async function GET(
    request: Request,
    { params }: { params: { id: string; media_id: string } }
) {
    const apiUrl = getApiBaseUrl();
    const { id, media_id } = await params;

    try {
        // Get auth token
        const { token } = await getAuthToken();

        if (!token) {
            return NextResponse.json({ message: "Authentication required" }, { status: 401 });
        }

        // Build the API URL for thumbnail
        const thumbnailUrl = `${apiUrl}/api/projects/${id}/documents/${media_id}/thumbnail`;

        const response = await fetch(thumbnailUrl, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "image/*"
            }
        });

        if (!response.ok) {
            // Return a default error response for failed thumbnail requests
            return NextResponse.json({ 
                message: "Thumbnail not available" 
            }, { status: response.status });
        }

        // Get the image data and content type
        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        // Return the image with proper headers
        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
            }
        });
    } catch (error) {
        console.error(`Error fetching thumbnail for media ${media_id}:`, error);
        return NextResponse.json({ 
            message: "Failed to fetch thumbnail" 
        }, { status: 500 });
    }
}