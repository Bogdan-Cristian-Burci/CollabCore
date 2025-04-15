import { proxyRequest } from "@/lib/server/api-helpers";
import { getApiBaseUrl } from "@/lib/server/auth-helpers";
import { NextResponse } from "next/server";

// GET - List all permissions
export async function GET() {
  // Use the same pattern as organizations and roles
  try {
    console.log("Using proxyRequest to fetch permissions");
    return proxyRequest(
      new Request(`${getApiBaseUrl()}/dummy`, { method: "GET" }),
      "/api/permissions", // PLURAL for consistency
      {
        method: "GET",
        customErrorMessage: "Failed to fetch permissions"
      }
    );
  } catch (error) {
    // If the proxyRequest fails, fall back to mock data
    console.error("proxyRequest failed:", error);
    console.log("Falling back to mock data");
    const mockData = await mockPermissionsData();
    return NextResponse.json(mockData);
  }
}

// For demo/development purposes
export async function mockPermissionsData() {
  return {
    permissions: [
      { id: 1, name: "users.create", display_name: "Create Users", description: "Can create new users", category: "Users" },
      { id: 2, name: "users.update", display_name: "Update Users", description: "Can update users", category: "Users" },
      { id: 3, name: "users.delete", display_name: "Delete Users", description: "Can delete users", category: "Users" },
      { id: 4, name: "users.view", display_name: "View Users", description: "Can view user details", category: "Users" },
      
      { id: 5, name: "roles.create", display_name: "Create Roles", description: "Can create new roles", category: "Roles" },
      { id: 6, name: "roles.update", display_name: "Update Roles", description: "Can update roles", category: "Roles" },
      { id: 7, name: "roles.delete", display_name: "Delete Roles", description: "Can delete roles", category: "Roles" },
      { id: 8, name: "roles.view", display_name: "View Roles", description: "Can view role details", category: "Roles" },
      
      { id: 9, name: "projects.create", display_name: "Create Projects", description: "Can create new projects", category: "Projects" },
      { id: 10, name: "projects.update", display_name: "Update Projects", description: "Can update projects", category: "Projects" },
      { id: 11, name: "projects.delete", display_name: "Delete Projects", description: "Can delete projects", category: "Projects" },
      { id: 12, name: "projects.view", display_name: "View Projects", description: "Can view project details", category: "Projects" },
      
      { id: 13, name: "teams.create", display_name: "Create Teams", description: "Can create new teams", category: "Teams" },
      { id: 14, name: "teams.update", display_name: "Update Teams", description: "Can update teams", category: "Teams" },
      { id: 15, name: "teams.delete", display_name: "Delete Teams", description: "Can delete teams", category: "Teams" },
      { id: 16, name: "teams.view", display_name: "View Teams", description: "Can view team details", category: "Teams" },
      
      { id: 17, name: "tasks.create", display_name: "Create Tasks", description: "Can create new tasks", category: "Tasks" },
      { id: 18, name: "tasks.update", display_name: "Update Tasks", description: "Can update tasks", category: "Tasks" },
      { id: 19, name: "tasks.delete", display_name: "Delete Tasks", description: "Can delete tasks", category: "Tasks" },
      { id: 20, name: "tasks.view", display_name: "View Tasks", description: "Can view task details", category: "Tasks" },
      { id: 21, name: "tasks.assign", display_name: "Assign Tasks", description: "Can assign tasks to users", category: "Tasks" },
      
      { id: 22, name: "comments.create", display_name: "Create Comments", description: "Can create comments", category: "Comments" },
      { id: 23, name: "comments.update", display_name: "Update Comments", description: "Can update comments", category: "Comments" },
      { id: 24, name: "comments.delete", display_name: "Delete Comments", description: "Can delete comments", category: "Comments" },
      
      { id: 25, name: "settings.manage", display_name: "Manage Settings", description: "Can manage system settings", category: "Settings" },
      { id: 26, name: "reports.view", display_name: "View Reports", description: "Can view system reports", category: "Reports" },
      { id: 27, name: "logs.view", display_name: "View Logs", description: "Can view system logs", category: "Logs" }
    ]
  };
}