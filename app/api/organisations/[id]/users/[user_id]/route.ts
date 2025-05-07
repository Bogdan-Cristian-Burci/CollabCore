import { proxyRequest } from "@/lib/server/api-helpers";

// GET - Get a user in an organization
export async function GET(
    request: Request,
    { params }: { params: { id: string, user_id: string } }
) {
  return proxyRequest(request, `/api/organisations/${params.id}/users/${params.user_id}`, {
    customErrorMessage: `User with ID ${params.user_id} not found in organization ${params.id}`
  });
}

// PUT - Update a user's role in an organization
export async function PUT(
    request: Request,
    { params }: { params: { id: string, user_id: string } }
) {
  return proxyRequest(request, `/api/organisations/${params.id}/users/${params.user_id}`, {
    method: 'PUT',
    successMessage: "User role updated successfully"
  });
}