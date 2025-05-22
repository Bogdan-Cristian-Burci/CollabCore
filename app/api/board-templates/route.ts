import { proxyRequest } from "@/lib/server/api-helpers";
import { getApiBaseUrl, getAuthToken } from "@/lib/server/auth-helpers";
import { NextRequest, NextResponse } from "next/server";

// GET - List board templates
export async function GET(request: NextRequest) {
  // Get the API base URL
  const apiUrl = getApiBaseUrl();
  
  try {
    // Get auth token
    const { token, status, error } = await getAuthToken();
    
    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    // Extract query parameters
    const url = new URL(request.url);
    const includeSystem = url.searchParams.get('include_system') === 'true';
    
    // Build URL with query parameters
    const apiEndpoint = new URL(`${apiUrl}/api/board-templates`);
    apiEndpoint.searchParams.append('include_system', includeSystem.toString());

    const response = await fetch(apiEndpoint.toString(), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
    });
    
    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      
      let message;
      try {
        const data = JSON.parse(text);
        message = data.message || "Failed to fetch board templates";
      } catch {
        message = "Failed to fetch board templates";
      }
      
      return NextResponse.json({ message }, { status });
    }
    
    // On success, return the API response
    const responseData = await response.json();
    
    // Return data as is - if it's nested under a data key, it will be preserved
    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch board templates" }, { status: 500 });
  }
}

// POST - Create new board template
export async function POST(request: Request) {
  return proxyRequest(request, "/api/board-templates", {
    successMessage: "Board template created successfully",
    successStatus: 201
  });
}