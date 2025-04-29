import { proxyRequest } from "@/lib/server/api-helpers";
import { getApiBaseUrl } from "@/lib/server/auth-helpers";

/**
 * Get user profile information
 */
export async function GET() {
  return proxyRequest(
    new Request(`${getApiBaseUrl()}/api/user`, { method: "GET" }),
    "/api/user",
    {
      method: "GET",
      customErrorMessage: "Failed to fetch user profile"
    }
  );
}

