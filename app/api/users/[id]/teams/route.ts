import { proxyRequest } from "@/lib/server/api-helpers";
import { getApiBaseUrl } from "@/lib/server/auth-helpers";

// GET - Get user teams
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    return proxyRequest(
        new Request(`${getApiBaseUrl()}/api/users/${id}/teams`, { method: "GET" }),
        `/api/users/${id}/teams`,
        {
            method: "GET",
            customErrorMessage: `Failed to fetch teams for user ${id}`
        }
    );
}
