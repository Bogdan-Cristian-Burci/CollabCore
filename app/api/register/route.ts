import { NextResponse } from "next/server";
import { z } from "zod";
import {fetchWithInterceptor} from "@/lib/fetch-interceptor";

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

    // Use the external API URL directly to avoid recursion
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost";
    const apiUrl = `${API_URL}/api/register`;
    
    console.log("API Route: Sending registration request to:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Origin": "http://localhost:3000"
      },
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