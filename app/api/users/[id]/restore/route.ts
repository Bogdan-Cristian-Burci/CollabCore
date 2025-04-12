import { proxyRequest } from "@/lib/server/api-helpers";
import { getApiBaseUrl } from "@/lib/server/auth-helpers";

// POST - Restore user
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    return proxyRequest(
        new Request(`${getApiBaseUrl()}/api/users/${id}/restore`, { method: "POST" }),
        `/api/users/${id}/restore`,
        {
            successMessage: "User restored successfully"
        }
    );
}
