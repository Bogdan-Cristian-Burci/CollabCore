import { proxyRequest } from "@/lib/server/api-helpers";
import { getApiBaseUrl } from "@/lib/server/auth-helpers";

// GET - List users
export async function GET() {
    return proxyRequest(
        new Request(`${getApiBaseUrl()}/api/users`, { method: "GET" }),
        "/api/users",
        {
            method: "GET",
            customErrorMessage: "Failed to fetch users"
        }
    );
}

// POST - Create new user
export async function POST(request: Request) {
    return proxyRequest(request, "/api/users", {
        successMessage: "User created successfully",
        successStatus: 201
    });
}
