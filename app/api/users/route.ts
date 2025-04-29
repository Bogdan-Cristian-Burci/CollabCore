import { proxyRequest } from "@/lib/server/api-helpers";
import { getApiBaseUrl } from "@/lib/server/auth-helpers";

// GET - List users
export async function GET(request: Request) {
    // Extract search params from the incoming request
    const { searchParams } = new URL(request.url);
    const organisation_id = searchParams.get('organisation_id');
    
    // Get all search parameters from the original request
    const allParams = Object.fromEntries(searchParams.entries());
    console.log('All request parameters:', allParams);
    
    // Build the API URL with all parameters
    let apiUrl = new URL(`${getApiBaseUrl()}/api/users`);
    
    // Add all params to the URL
    for (const [key, value] of searchParams.entries()) {
        apiUrl.searchParams.append(key, value);
    }
    
    console.log(`API URL with all parameters: ${apiUrl.toString()}`);
    
    // Log specific organization filter
    if (organisation_id) {
        console.log(`Filtering users by organisation_id: ${organisation_id}`);
    } else {
        console.log('No organisation_id provided');
    }
    
    // Create request with cache control headers
    const headers = new Headers();
    headers.append('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.append('Pragma', 'no-cache');
    headers.append('Expires', '0');
    
    // Use the URL object's toString() method to get the complete URL string
    const apiUrlString = apiUrl.toString();
    
    console.log('Final API request URL:', apiUrlString);
    
    return proxyRequest(
        new Request(apiUrlString, { 
            method: "GET",
            headers: headers
        }),
        // Keep the original path but with query parameters
        `/api/users${request.url.includes('?') ? request.url.substring(request.url.indexOf('?')) : ''}`,
        {
            method: "GET",
            customErrorMessage: "Failed to fetch users"
        }
    );
}

// POST - Create new user
export async function POST(request: Request) {
    return proxyRequest(request, "/api/users", {
        successMessage: "User created successfully",
        successStatus: 201
    });
}
