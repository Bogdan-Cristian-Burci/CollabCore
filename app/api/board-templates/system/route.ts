import { proxyRequest } from "@/lib/server/api-helpers";
import { getApiBaseUrl, getAuthToken } from "@/lib/server/auth-helpers";
import { NextRequest, NextResponse } from "next/server";

// GET - Get system board templates
export async function GET() {
  // Get the API base URL
  const apiUrl = getApiBaseUrl();
  
  try {
    // Get auth token
    const { token, status, error } = await getAuthToken();
    
    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    const response = await fetch(`${apiUrl}/api/board-templates/system`, {
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
        message = data.message || "Failed to fetch system board templates";
      } catch {
        message = "Failed to fetch system board templates";
      }
      
      return NextResponse.json({ message }, { status });
    }
    
    // On success, return the API response
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch system board templates" }, { status: 500 });
  }
}