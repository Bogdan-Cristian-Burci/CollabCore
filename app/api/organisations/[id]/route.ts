import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Helper function to get auth token
async function getAuthToken() {
  const session = await auth();
  const accessToken = session?.user?.accessToken;

  if (!accessToken) {
    return { token: null, error: "Unauthorized", status: 401 };
  }

  return { token: accessToken, error: null, status: 200 };
}

// GET - Get a specific organisation by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { token, error, status } = await getAuthToken();
    
    if (error) {
      return NextResponse.json({ message: error }, { status });
    }
    
    const id = params.id;
    
    // Use the external API URL
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost";
    const apiUrl = `${API_URL}/api/organisations/${id}`;
    
    console.log(`API Route: Fetching organisation ${id} from:`, apiUrl);
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch organisation ${id}, status:`, response.status);
      return NextResponse.json(
        { message: "Failed to fetch organisation" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Error fetching organisation:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// PATCH - Update a specific organisation
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { token, error, status } = await getAuthToken();
    
    if (error) {
      return NextResponse.json({ message: error }, { status });
    }
    
    const id = params.id;
    
    // Parse the request body
    const body = await request.json();
    
    // Use the external API URL
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost";
    const apiUrl = `${API_URL}/api/organisations/${id}`;
    
    console.log(`API Route: Updating organisation ${id}`);
    
    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      console.error(`Failed to update organisation ${id}, status:`, response.status);
      return NextResponse.json(
        { message: data.message || "Failed to update organisation" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Error updating organisation:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific organisation
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { token, error, status } = await getAuthToken();
    
    if (error) {
      return NextResponse.json({ message: error }, { status });
    }
    
    const id = params.id;
    
    // Use the external API URL
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost";
    const apiUrl = `${API_URL}/api/organisations/${id}`;
    
    console.log(`API Route: Deleting organisation ${id}`);
    
    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    
    // If no content is returned (204)
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    
    // Try to parse JSON if available
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      console.error(`Failed to delete organisation ${id}, status:`, response.status);
      return NextResponse.json(
        { message: data.message || "Failed to delete organisation" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Error deleting organisation:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}