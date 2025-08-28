import { proxyRequest } from "@/lib/server/api-helpers";
import { NextResponse } from "next/server";

// DELETE - Delete document
export async function DELETE(request: Request, { params }: { params: { id: string; media_id: string } }) {
    try {
        const { id, media_id } = await params;
        
        return proxyRequest(request, `/api/projects/${id}/documents/${media_id}`, {
            successMessage: "Document deleted successfully",
            successStatus: 200
        });
    } catch (error) {
        return NextResponse.json({ 
            message: "Failed to delete document",
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}