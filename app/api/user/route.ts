import { proxyRequest } from "@/lib/server/api-helpers";
import { getApiBaseUrl } from "@/lib/server/auth-helpers";

/**
 * Get user profile information
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeParams = searchParams.toString() ? `?${searchParams.toString()}` : '';
  
  return proxyRequest(
    new Request(`${getApiBaseUrl()}/api/user${includeParams}`, { method: "GET" }),
    `/api/user${includeParams}`,
    {
      method: "GET",
      customErrorMessage: "Failed to fetch user profile"
    }
  );
}

