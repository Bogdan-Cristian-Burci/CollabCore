import { proxyRequest } from "@/lib/server/api-helpers";

// GET - List organisations
export async function GET() {
  return proxyRequest(
      null as unknown as Request, // Type hack since GET doesn't need the request
      "/api/organisations",
      {
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