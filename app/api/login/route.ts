import { NextResponse } from "next/server";
import { z } from "zod";

// Define the validation schema for login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    
    // Validate the request data
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      // Return validation errors
      console.log("Validation failed:", result.error.format());
      return NextResponse.json(
        { message: "Validation failed", errors: result.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Use the correct URL for Laravel backend
    const apiUrl = "http://localhost/api/login";
    
    let userData = null;
    
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest" // Laravel often requires this
        },
        body: JSON.stringify({
          email,
          password
        })
      });
      
      if (response.ok) {
        userData = await response.json();
      } else {
        return NextResponse.json(
          { message: "Invalid email or password" },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      return NextResponse.json(
        { message: "Connection error" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}