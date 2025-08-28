import { proxyRequest } from "@/lib/server/api-helpers";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: { id: string; user_id: string } }) {
    try {
        const { id, user_id } = await params;
        
        return proxyRequest(request, `/api/projects/${id}/users/${user_id}`, {
            successMessage: "User removed from project successfully",
            successStatus: 200
        });
    } catch (error) {
        return NextResponse.json({ 
            message: "Failed to remove user from project",
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}