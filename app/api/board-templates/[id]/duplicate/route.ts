import { proxyRequest } from "@/lib/server/api-helpers";
import { NextRequest, NextResponse } from "next/server";

// POST - Duplicate board template
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Use await for params to fix the warning
  const param = await params;
  const id = await Promise.resolve(param.id);
  
  return proxyRequest(
    request,
    `/api/board-templates/${id}/duplicate`,
    {
      method: "POST",
      successMessage: "Board template duplicated successfully",
      customErrorMessage: `Failed to duplicate board template with ID ${id}`
    }
  );
}