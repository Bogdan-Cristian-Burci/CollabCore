import { proxyRequest } from "@/lib/server/api-helpers";
import { NextRequest, NextResponse } from "next/server";
import { mockRolesData } from "../route";

// GET - Get role by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  return proxyRequest(
    new Request(`${process.env.NEXT_PUBLIC_API_URL}/dummy`, { method: "GET" }),
    `/api/roles/${id}`,
    {
      method: "GET",
      customErrorMessage: `Failed to fetch role with ID ${id}`
    }
  );
}

// PUT - Update role
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  return proxyRequest(
    request,
    `/api/roles/${id}`,
    {
      method: "PUT",
      successMessage: "Role updated successfully",
      customErrorMessage: `Failed to update role with ID ${id}`
    }
  );
}

// DELETE - Delete role
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  return proxyRequest(
    request,
    `/api/roles/${id}`,
    {
      method: "DELETE",
      successMessage: "Role deleted successfully",
      customErrorMessage: `Failed to delete role with ID ${id}`
    }
  );
}