import { proxyRequest } from "@/lib/server/api-helpers";
import { getApiBaseUrl } from "@/lib/server/auth-helpers";

// GET - Get user projects
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    return proxyRequest(
        new Request(`${getApiBaseUrl()}/api/users/${id}/projects`, { method: "GET" }),
        `/api/users/${id}/projects`,
        {
            method: "GET",
            customErrorMessage: `Failed to fetch projects for user ${id}`
        }
    );
}
