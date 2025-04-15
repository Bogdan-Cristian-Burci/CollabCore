import { proxyRequest } from "@/lib/server/api-helpers";
import { getApiBaseUrl, getAuthToken } from "@/lib/server/auth-helpers";
import { NextResponse } from "next/server";

// GET - List roles
export async function GET() {
  // Debug the API base URL
  const apiUrl = getApiBaseUrl();
  console.log(`API Base URL: ${apiUrl}`);
  
  // First try to use the proxyRequest pattern that works for organizations
  try {
    console.log("Using proxyRequest to fetch roles");
    
    // Add a direct fetch attempt for debugging
    try {
      console.log("Attempting direct fetch to debug");
      const { token } = await getAuthToken();
      if (token) {
        const directResponse = await fetch(`${apiUrl}/api/roles`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        });
        console.log(`Direct fetch status: ${directResponse.status}`);
        if (directResponse.ok) {
          const directData = await directResponse.json();
          console.log("Direct fetch response:", directData);
        }
      }
    } catch (debugError) {
      console.log("Debug fetch failed:", debugError);
    }
    
    // Now use the proper proxyRequest
    return proxyRequest(
      new Request(`${getApiBaseUrl()}/dummy`, { method: "GET" }),
      "/api/roles", // PLURAL as confirmed multiple times
      {
        method: "GET",
        customErrorMessage: "Failed to fetch roles"
      }
    );
  } catch (error) {
    // If the proxyRequest fails, fall back to mock data
    console.error("proxyRequest failed:", error);
    console.log("Falling back to mock data");
    const mockData = await mockRolesData();
    return NextResponse.json(mockData);
  }
}

// POST - Create new role
export async function POST(request: Request) {
  return proxyRequest(request, "/api/roles", { // PLURAL as confirmed multiple times
    successMessage: "Role created successfully",
    successStatus: 201
  });
}

// For demo/development purposes
export async function mockRolesData() {
  return {
    roles: [
      {
        id: 1,
        name: "admin",
        display_name: "Administrator",
        description: "Full access to all system features",
        level: 100,
        permissions: [
          { id: 1, name: "users.create", display_name: "Create Users", description: "Can create new users", category: "Users" },
          { id: 2, name: "users.update", display_name: "Update Users", description: "Can update users", category: "Users" },
          { id: 25, name: "settings.manage", display_name: "Manage Settings", description: "Can manage system settings", category: "Settings" }
        ],
        users: [
          { id: 1, name: "John Admin" }
        ],
        users_count: 1,
        is_system_role: true
      },
      {
        id: 2,
        name: "manager",
        display_name: "Manager",
        description: "Can manage projects and teams",
        level: 80,
        permissions: [
          { id: 9, name: "projects.create", display_name: "Create Projects", description: "Can create new projects", category: "Projects" },
          { id: 13, name: "teams.create", display_name: "Create Teams", description: "Can create new teams", category: "Teams" }
        ],
        users: [
          { id: 2, name: "Jane Manager" },
          { id: 3, name: "Mike Manager" }
        ],
        users_count: 2,
        is_system_role: true
      },
      {
        id: 3,
        name: "developer",
        display_name: "Developer",
        description: "Can work on assigned tasks and projects",
        level: 50,
        permissions: [
          { id: 12, name: "projects.view", display_name: "View Projects", description: "Can view project details", category: "Projects" },
          { id: 17, name: "tasks.create", display_name: "Create Tasks", description: "Can create new tasks", category: "Tasks" }
        ],
        users: [
          { id: 4, name: "Alice Dev" },
          { id: 5, name: "Bob Dev" },
          { id: 6, name: "Charlie Dev" }
        ],
        users_count: 3,
        is_system_role: true
      },
      {
        id: 4,
        name: "guest",
        display_name: "Guest",
        description: "Limited access to view content only",
        level: 10,
        permissions: [
          { id: 4, name: "users.view", display_name: "View Users", description: "Can view user details", category: "Users" },
          { id: 8, name: "roles.view", display_name: "View Roles", description: "Can view role details", category: "Roles" }
        ],
        users: [],
        users_count: 0,
        is_system_role: true
      },
      {
        id: 5,
        name: "custom",
        display_name: "Custom Role",
        description: "A custom role with specific permissions",
        level: 30,
        permissions: [
          { id: 22, name: "comments.create", display_name: "Create Comments", description: "Can create comments", category: "Comments" }
        ],
        users: [
          { id: 7, name: "Custom User" }
        ],
        users_count: 1,
        is_system_role: false
      }
    ]
  };
}
