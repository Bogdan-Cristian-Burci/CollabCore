import { proxyRequest } from "@/lib/server/api-helpers";
import { getApiBaseUrl } from "@/lib/server/auth-helpers";

/**
 * Get user profile information or all users for an organization
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organization_id');
  
  // If organization_id is provided, fetch all users for that organization
  if (organizationId) {
    const userParams = new URLSearchParams(searchParams);
    const includeParams = userParams.toString() ? `?${userParams.toString()}` : '';
    
    return proxyRequest(
      new Request(`${getApiBaseUrl()}/api/users${includeParams}`, { method: "GET" }),
      `/api/users${includeParams}`,
      {
        method: "GET",
        customErrorMessage: "Failed to fetch users"
      }
    );
  }
  
  // Otherwise, fetch current user profile
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

