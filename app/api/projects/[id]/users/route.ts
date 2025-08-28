import { proxyRequest } from "@/lib/server/api-helpers";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;
        
        const clonedRequest = request.clone();
        const body = await clonedRequest.json();
        const { userIds } = body;

        if (!userIds || !Array.isArray(userIds)) {
            return NextResponse.json({ 
                message: "userIds array is required" 
            }, { status: 400 });
        }

        const backendBody = { user_ids: userIds };
        const proxyRequestBody = new Request(request.url, {
            method: 'POST',
            headers: request.headers,
            body: JSON.stringify(backendBody)
        });
        
        return proxyRequest(proxyRequestBody, `/api/projects/${id}/users`, {
            successMessage: "Users added to project successfully",
            successStatus: 200
        });
    } catch (error) {
        return NextResponse.json({ 
            message: "Failed to add users to project",
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}