import { proxyRequest } from "@/lib/server/api-helpers";
import { NextRequest } from "next/server";

// GET - List role permissions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Use await for params to fix the warning
  const id = await Promise.resolve(params.id);
  
  return proxyRequest(
    new Request(`${process.env.NEXT_PUBLIC_API_URL}/dummy`, { method: "GET" }),
    `/api/roles/${id}/permissions`,
    {
      method: "GET",
      customErrorMessage: `Failed to fetch permissions for role with ID ${id}`
    }
  );
}

// POST - Add permissions to a role
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Use await for params to fix the warning
  const id = await Promise.resolve(params.id);
  
  return proxyRequest(
    request,
    `/api/roles/${id}/permissions`,
    {
      method: "POST",
      successMessage: "Permissions added to role successfully",
      customErrorMessage: `Failed to add permissions to role with ID ${id}`
    }
  );
}

// DELETE - Remove permissions from a role
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Use await for params to fix the warning
  const id = await Promise.resolve(params.id);
  
  return proxyRequest(
    request,
    `/api/roles/${id}/permissions`,
    {
      method: "DELETE",
      successMessage: "Permissions removed from role successfully",
      customErrorMessage: `Failed to remove permissions from role with ID ${id}`
    }
  );
}