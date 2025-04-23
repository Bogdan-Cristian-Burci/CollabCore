import { proxyRequest } from "@/lib/server/api-helpers";
import { getApiBaseUrl, getAuthToken } from "@/lib/server/auth-helpers";
import { NextResponse } from "next/server";

// GET - List roles
export async function GET() {
  // Get the API base URL and add detailed debugging
  const apiUrl = getApiBaseUrl();
  
  try {
    // Get auth token with detailed logging
    const { token, status, error } = await getAuthToken();
    
    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    const response = await fetch(`${apiUrl}/api/roles`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
    
    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      
      let message;
      try {
        const data = JSON.parse(text);
        message = data.message || "Failed to fetch roles";
      } catch {
        message = "Failed to fetch roles";
      }
      
      // Special handling for 403 errors
      if (status === 403) {
        // Create a more user-friendly error message
        return NextResponse.json({
          message: "You don't have permission to access roles.",
          rolesForbidden: true
        }, { status: 403 });
      }
      
      return NextResponse.json({ message }, { status });
    }
    
    // On success, return the API response
    const data = await response.json();
    
    // Don't modify the response structure - return it exactly as received
    // This ensures the client receives the same data format as your Postman request
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch roles" }, { status: 500 });
  }
}

// POST - Create new role
export async function POST(request: Request) {
  return proxyRequest(request, "/api/roles", { // PLURAL as confirmed multiple times
    successMessage: "Role created successfully",
    successStatus: 201
  });
}

// No mock data - we only use real API data
