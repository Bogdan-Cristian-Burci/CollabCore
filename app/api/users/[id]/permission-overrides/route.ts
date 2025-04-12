import { proxyRequest } from "@/lib/server/api-helpers";
import { getApiBaseUrl } from "@/lib/server/auth-helpers";

// GET - Get user permission overrides
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    return proxyRequest(
        new Request(`${getApiBaseUrl()}/api/users/${id}/permission-overrides`, { method: "GET" }),
        `/api/users/${id}/permission-overrides`,
        {
            method: "GET",
            customErrorMessage: `Failed to fetch permission overrides for user ${id}`
        }
    );
}

// POST - Set permission override
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    return proxyRequest(request, `/api/users/${id}/permission-overrides`, {
        successMessage: "Permission override set successfully"
    });
}
