import { NextResponse } from "next/server";
import { z } from "zod";

// Define the validation schema for registration
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the request data
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      // Return validation errors
      return NextResponse.json(
        { message: "Validation failed", errors: result.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // Here you would typically:
    // 1. Check if the user already exists
    // 2. Hash the password
    // 3. Create the user in your database
    // 4. Generate a session token
    
    // For this example, we'll just return a success response
    // In a real application, replace this with actual user creation logic
    
    return NextResponse.json(
      { message: "User registered successfully" },
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