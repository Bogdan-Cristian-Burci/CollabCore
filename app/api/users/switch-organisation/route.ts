import { proxyRequest } from "@/lib/server/api-helpers";

// POST - Switch user organisation
export async function POST(request: Request) {
    return proxyRequest(request, "/api/users/switch-organisation", {
        successMessage: "Organisation switched successfully"
    });
}
