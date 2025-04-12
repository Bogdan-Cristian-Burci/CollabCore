import { proxyRequest } from "@/lib/server/api-helpers";

// GET - Get a specific organisation by ID
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
  return proxyRequest(request, `/api/organisations/${params.id}`, {
    customErrorMessage: `Organization with ID ${params.id} not found`
  });
}

// PATCH - Update a specific organisation
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
  return proxyRequest(request, `/api/organisations/${params.id}`, {
    method: 'PATCH',
    successMessage: "Organization updated successfully"
  });
}

// DELETE - Delete a specific organisation
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
  return proxyRequest(request, `/api/organisations/${params.id}`, {
    method: 'DELETE',
    successMessage: "Organization deleted successfully"
  });
}