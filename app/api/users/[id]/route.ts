import { proxyRequest } from "@/lib/server/api-helpers";
import { getApiBaseUrl } from "@/lib/server/auth-helpers";

// GET - Get user by ID
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = await Promise.resolve(params);
    
    // Get query parameters from the original request URL
    const url = new URL(request.url);
    const includeParam = url.searchParams.get('include');
    
    // Create the target endpoint path with query parameters
    let endpoint = `/api/users/${id}`;
    if (includeParam) {
        endpoint += `?include=${includeParam}`;
    }
    
    console.log(`Using endpoint with params: ${getApiBaseUrl()}${endpoint}`);
    
    return proxyRequest(
        request,
        endpoint,
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
    const { id } = await Promise.resolve(params);
    return proxyRequest(request, `/api/users/${id}`, {
        successMessage: "User updated successfully"
    });
}

// DELETE - Delete user
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = await Promise.resolve(params);
    return proxyRequest(
        new Request(`${getApiBaseUrl()}/api/users/${id}`, { method: "DELETE" }),
        `/api/users/${id}`,
        {
            successMessage: "User deleted successfully"
        }
    );
}
