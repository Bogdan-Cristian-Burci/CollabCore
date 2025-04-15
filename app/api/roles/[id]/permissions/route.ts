import { proxyRequest } from "@/lib/server/api-helpers";
import { NextRequest } from "next/server";

// GET - List role permissions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  return proxyRequest(
    new Request(`${process.env.NEXT_PUBLIC_API_URL}/dummy`, { method: "GET" }),
    `/api/roles/${id}/permissions`,
    {
      method: "GET",
      customErrorMessage: `Failed to fetch permissions for role with ID ${id}`
    }
  );
}

// PUT - Update role permissions (add/remove permissions)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  return proxyRequest(
    request,
    `/api/roles/${id}/permissions`,
    {
      method: "PUT",
      successMessage: "Role permissions updated successfully",
      customErrorMessage: `Failed to update permissions for role with ID ${id}`
    }
  );
}