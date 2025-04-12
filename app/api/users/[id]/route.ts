import { proxyRequest } from "@/lib/server/api-helpers";
import { getApiBaseUrl } from "@/lib/server/auth-helpers";

// GET - Get user by ID
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    return proxyRequest(
        new Request(`${getApiBaseUrl()}/api/users/${id}`, { method: "GET" }),
        `/api/users/${id}`,
        {
            method: "GET",
            customErrorMessage: `Failed to fetch user ${id}`
        }
    );
}

// PATCH - Update user
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    return proxyRequest(request, `/api/users/${id}`, {
        successMessage: "User updated successfully"
    });
}

// DELETE - Delete user
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    return proxyRequest(
        new Request(`${getApiBaseUrl()}/api/users/${id}`, { method: "DELETE" }),
        `/api/users/${id}`,
        {
            successMessage: "User deleted successfully"
        }
    );
}
