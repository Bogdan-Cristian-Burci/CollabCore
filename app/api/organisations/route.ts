import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Helper function to get auth token and API URL
async function getAuthToken() {
  const session = await auth();
  const accessToken = session?.user?.accessToken;

  if (!accessToken) {
    return { token: null, error: "Unauthorized", status: 401 };
  }

  return { token: accessToken, error: null, status: 200 };
}

// GET - List organisations
export async function GET() {
  try {
    const { token, error, status } = await getAuthToken();
    
    if (error) {
      return NextResponse.json({ message: error }, { status });
    }
    
    // Use the external API URL
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost";
    const apiUrl = `${API_URL}/api/organisations`;
    
    console.log("API Route: Fetching organisations from:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      console.error("Failed to fetch organisations, status:", response.status);
      return NextResponse.json(
        { message: "Failed to fetch organisations" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Error fetching organisations:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// POST - Create new organisation
export async function POST(request: Request) {
  try {
    const { token, error, status } = await getAuthToken();
    
    if (error) {
      return NextResponse.json({ message: error }, { status });
    }
    
    // Parse the request body
    const body = await request.json();
    
    // Use the external API URL
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost";
    const apiUrl = `${API_URL}/api/organisations`;
    
    console.log("API Route: Creating organisation");
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      console.error("Failed to create organisation, status:", response.status);
      return NextResponse.json(
        { message: data.message || "Failed to create organisation" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
    
  } catch (error) {
    console.error("Error creating organisation:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}