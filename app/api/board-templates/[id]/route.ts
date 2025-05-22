import { proxyRequest } from "@/lib/server/api-helpers";
import { NextRequest, NextResponse } from "next/server";

// GET - Get board template by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Use await for params to fix the warning
  const param = await params;
  const id = await Promise.resolve(param.id);
  
  return proxyRequest(
    new Request(`${process.env.NEXT_PUBLIC_API_URL}/dummy`, { method: "GET" }),
    `/api/board-templates/${id}`,
    {
      method: "GET",
      customErrorMessage: `Failed to fetch board template with ID ${id}`
    }
  );
}

// PATCH - Update board template
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Use await for params to fix the warning
  const param = await params;
  const id = await Promise.resolve(param.id);
  
  return proxyRequest(
    request,
    `/api/board-templates/${id}`,
    {
      method: "PATCH",
      successMessage: "Board template updated successfully",
      customErrorMessage: `Failed to update board template with ID ${id}`
    }
  );
}

// DELETE - Delete board template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Use await for params to fix the warning
  const param = await params;
  const id = await Promise.resolve(param.id);
  
  return proxyRequest(
    request,
    `/api/board-templates/${id}`,
    {
      method: "DELETE",
      successMessage: "Board template deleted successfully",
      customErrorMessage: `Failed to delete board template with ID ${id}`
    }
  );
}