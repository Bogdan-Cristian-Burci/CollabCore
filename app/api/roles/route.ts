import { proxyRequest } from "@/lib/server/api-helpers";
import { getApiBaseUrl, getAuthToken } from "@/lib/server/auth-helpers";
import { NextResponse } from "next/server";

// GET - List roles
export async function GET() {
  // Get the API base URL and add detailed debugging
  const apiUrl = getApiBaseUrl();
  console.log(`[DEBUG] Roles API URL: ${apiUrl}/api/roles`);
  
  try {
    // Get auth token with detailed logging
    console.log("[DEBUG] Getting auth token for roles request");
    const { token, status, error } = await getAuthToken();
    
    console.log(`[DEBUG] Auth token status: ${status}, Error: ${error || 'none'}`);
    console.log(`[DEBUG] Token present: ${!!token}`);
    
    if (!token) {
      console.log("[DEBUG] No token available, returning 401");
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }
    
    // Log token details (but not the actual token for security)
    console.log(`[DEBUG] Token length: ${token.length}, first 5 chars: ${token.substring(0, 5)}...`);
    
    // Now try the actual roles endpoint
    console.log("[DEBUG] Making roles request to the external API");
    const response = await fetch(`${apiUrl}/api/roles`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
    
    console.log(`[DEBUG] Roles response status: ${response.status}`);
    
    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.log(`[DEBUG] Error response text: ${text}`);
      
      let message;
      try {
        const data = JSON.parse(text);
        message = data.message || "Failed to fetch roles";
        console.log(`[DEBUG] Parsed error message: ${message}`);
      } catch {
        message = "Failed to fetch roles";
        console.log(`[DEBUG] Could not parse error message, using default`);
      }
      
      // Special handling for 403 errors
      if (status === 403) {
        console.log("[DEBUG] 403 Forbidden - likely a permissions issue");
        // Create a more user-friendly error message
        return NextResponse.json({
          message: "You don't have permission to access roles.",
          rolesForbidden: true
        }, { status: 403 });
      }
      
      return NextResponse.json({ message }, { status });
    }
    
    // On success, return the API response
    console.log("[DEBUG] Roles request successful, parsing JSON");
    const data = await response.json();
    console.log(`[DEBUG] Roles data received:`, data);
    console.log(`[DEBUG] Response keys: ${Object.keys(data).join(', ')}`);
    
    // Don't modify the response structure - return it exactly as received
    // This ensures the client receives the same data format as your Postman request
    
    // Log what format we're returning
    if (data.roles && Array.isArray(data.roles)) {
      console.log(`[DEBUG] Returning response with roles array containing ${data.roles.length} items`);
    } else if (Array.isArray(data)) {
      console.log(`[DEBUG] Returning direct array response with ${data.length} items`);
    } else if (data.data && Array.isArray(data.data)) {
      console.log(`[DEBUG] Returning response with data array containing ${data.data.length} items`);
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("[DEBUG] Unhandled error in roles API route:", error);
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
