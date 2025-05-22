import { proxyRequest } from "@/lib/server/api-helpers";
import { NextRequest, NextResponse } from "next/server";

// POST - Toggle board template active status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Use await for params to fix the warning
  const param = await params;
  const id = await Promise.resolve(param.id);
  
  return proxyRequest(
    request,
    `/api/board-templates/${id}/toggle-active`,
    {
      method: "POST",
      successMessage: "Board template status updated successfully",
      customErrorMessage: `Failed to toggle active status for board template with ID ${id}`
    }
  );
}