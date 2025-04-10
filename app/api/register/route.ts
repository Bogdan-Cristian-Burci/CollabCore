import { NextResponse } from "next/server";
import { z } from "zod";

// Define the validation schema for registration
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  passwordConfirmation: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    
    // Validate the request data
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      // Return validation errors
      console.log("Validation failed:", result.error.format());
      return NextResponse.json(
        { message: "Validation failed", errors: result.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password, passwordConfirmation } = result.data;

    // Confirm passwords match
    if (password !== passwordConfirmation) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Forward the request to the backend API
    const apiUrl = "http://localhost/api/register";
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Origin": "http://localhost:3000"
      },
      credentials: "include",
      body: JSON.stringify({
        name,
        email,
        password,
        // Laravel expects password_confirmation instead of passwordConfirmation
        password_confirmation: passwordConfirmation
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Registration failed" }));
      return NextResponse.json(
        { message: errorData.message || "Registration failed" },
        { status: response.status }
      );
    }

    const data = await response.json().catch(() => ({ message: "User registered successfully" }));
    
    return NextResponse.json(
      data,
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}