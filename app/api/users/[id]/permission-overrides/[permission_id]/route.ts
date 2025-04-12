import { proxyRequest } from "@/lib/server/api-helpers";
import { getApiBaseUrl } from "@/lib/server/auth-helpers";

// DELETE - Delete permission override
export async function DELETE(
    request: Request,
    { params }: { params: { id: string; permission_id: string } }
) {
    const { id, permission_id } = params;
    return proxyRequest(
        new Request(`${getApiBaseUrl()}/api/users/${id}/permission-overrides/${permission_id}`, { method: "DELETE" }),
        `/api/users/${id}/permission-overrides/${permission_id}`,
        {
            successMessage: "Permission override deleted successfully"
        }
    );
}
