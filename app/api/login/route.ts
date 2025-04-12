import { NextResponse } from "next/server";
import { z } from "zod";
import {fetchWithInterceptor} from "@/lib/fetch-interceptor";

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
      return NextResponse.json(
        { message: "Validation failed", errors: result.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    
    // Use the external API URL directly to avoid recursion
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost";
    const apiUrl = `${API_URL}/api/login`;
    
    
    try {
      // Use direct fetch to avoid any complexity
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({
          email,
          password
        })
      });
      
      if (response.ok) {
        const userData = await response.json();
        return NextResponse.json(userData, { status: 200 });
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
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}