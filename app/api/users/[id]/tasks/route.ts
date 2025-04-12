import { proxyRequest } from "@/lib/server/api-helpers";
import { getApiBaseUrl } from "@/lib/server/auth-helpers";

// GET - Get user tasks
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    return proxyRequest(
        new Request(`${getApiBaseUrl()}/api/users/${id}/tasks`, { method: "GET" }),
        `/api/users/${id}/tasks`,
        {
            method: "GET",
            customErrorMessage: `Failed to fetch tasks for user ${id}`
        }
    );
}
