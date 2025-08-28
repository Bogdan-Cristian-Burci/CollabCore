import { proxyRequest } from "@/lib/server/api-helpers";
import { getApiBaseUrl, getAuthToken } from "@/lib/server/auth-helpers";
import { NextResponse } from "next/server";

// Get all board types
export async function GET(request: Request) {
    const apiUrl = getApiBaseUrl();
    
    try {
        const { token, status, error } = await getAuthToken();

        if (!token) {
            return NextResponse.json({ message: "Authentication required" }, { status: 401 });
        }

        const response = await fetch(`${apiUrl}/api/board-types`, {
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
                message = data.message || "Failed to fetch board types";
            } catch {
                message = "Failed to fetch board types";
            }

            return NextResponse.json({ message }, { status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ message: "Failed to fetch board types" }, { status: 500 });
    }
}