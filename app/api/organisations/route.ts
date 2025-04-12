import { proxyRequest } from "@/lib/server/api-helpers";
import { getApiBaseUrl } from "@/lib/server/auth-helpers";

// GET - List organisations
export async function GET() {
  return proxyRequest(
      new Request(`${getApiBaseUrl()}/dummy`, { method: "GET" }), // Use consistent API base URL
      "/api/organisations",
      {
        method: "GET",
        customErrorMessage: "Failed to fetch organizations"
      }
  );
}

// POST - Create new organisation
export async function POST(request: Request) {
  return proxyRequest(request, "/api/organisations", {
    successMessage: "Organization created successfully",
    successStatus: 201
  });
}