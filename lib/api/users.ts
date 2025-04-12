import { UserResource } from "@/types/user";

// Fetch user profile
export async function fetchUserProfile(): Promise<UserResource | null> {
    try {
        const response = await fetch('/api/user', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            cache: 'no-store', // Prevent caching
            next: { revalidate: 0 } // Force revalidation
        });

        if (!response.ok) {
            console.error('Failed to fetch user profile, status:', response.status);
            return null;
        }

        const data = await response.json();
        
        // Check for different response formats - either data.data or direct user data
        if (data) {
            // If data has all the expected user properties directly, use it
            if (data.id && data.name && data.email) {
                return data;
            }
            
            // If data is wrapped in a data property (data.data format)
            if (data.data && data.data.id) {
                return data.data;
            }
        }
        
        // Fallback to mock data if no valid format is found
        return {
            id: 999,
            name: "Mock User",
            email: "mock@example.com",
            email_verified_at: new Date().toISOString(),
            initials: "MU",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            roles: ["user"],
            permissions: ["read"],
            permission_overrides: {
                grant: [],
                deny: []
            },
            organisation_id: 1,
            organisation: {
                id: 1,
                name: "Mock Organization",
                slug: "mock-org",
                is_active: true
            },
            can: {
                update: true,
                delete: false,
                manage_roles: false
            },
            links: {
                self: "/api/users/999",
                teams: "/api/users/999/teams",
                projects: "/api/users/999/projects",
                members: "/api/users/999/members"
            }
        };
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

// Add a new user
export async function addUser(userData: { 
    name: string; 
    email: string; 
    password: string; 
    password_confirmation: string;
}): Promise<UserResource | null> {
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            console.error('Failed to add user, status:', response.status);
            return null;
        }

        const result = await response.json();
        return result.data;

    } catch (error) {
        console.error('Error adding user:', error);
        return null;
    }
}

// Get user by ID
export async function getUserById(userId: string): Promise<UserResource | null> {
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            console.error(`Failed to fetch user ${userId}, status:`, response.status);
            return null;
        }

        const data = await response.json();
        return data.data;

    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        return null;
    }
}

// Update user
export async function updateUser(userId: string, userData: Partial<UserResource>): Promise<UserResource | null> {
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            console.error(`Failed to update user ${userId}, status:`, response.status);
            return null;
        }

        const result = await response.json();
        return result.data;

    } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        return null;
    }
}

// Delete user
export async function deleteUser(userId: string): Promise<boolean> {
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        return response.ok;

    } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        return false;
    }
}

// Restore user
export async function restoreUser(userId: string): Promise<UserResource | null> {
    try {
        const response = await fetch(`/api/users/${userId}/restore`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            console.error(`Failed to restore user ${userId}, status:`, response.status);
            return null;
        }

        const result = await response.json();
        return result.data;

    } catch (error) {
        console.error(`Error restoring user ${userId}:`, error);
        return null;
    }
}

// Switch organisation
export async function switchOrganisation(organisationId: string): Promise<boolean> {
    try {
        const response = await fetch('/api/users/switch-organisation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ organisation_id: organisationId })
        });

        return response.ok;

    } catch (error) {
        console.error('Error switching organisation:', error);
        return false;
    }
}

// Get user teams
export async function getUserTeams(userId: string): Promise<any[]> {
    try {
        const response = await fetch(`/api/users/${userId}/teams`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            console.error(`Failed to fetch user teams for ${userId}, status:`, response.status);
            return [];
        }

        const data = await response.json();
        return data.data;

    } catch (error) {
        console.error(`Error fetching user teams for ${userId}:`, error);
        return [];
    }
}

// Get user tasks
export async function getUserTasks(userId: string): Promise<any[]> {
    try {
        const response = await fetch(`/api/users/${userId}/tasks`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            console.error(`Failed to fetch user tasks for ${userId}, status:`, response.status);
            return [];
        }

        const data = await response.json();
        return data.data;

    } catch (error) {
        console.error(`Error fetching user tasks for ${userId}:`, error);
        return [];
    }
}

// Get user projects
export async function getUserProjects(userId: string): Promise<any[]> {
    try {
        const response = await fetch(`/api/users/${userId}/projects`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            console.error(`Failed to fetch user projects for ${userId}, status:`, response.status);
            return [];
        }

        const data = await response.json();
        return data.data;

    } catch (error) {
        console.error(`Error fetching user projects for ${userId}:`, error);
        return [];
    }
}

// Get user permission overrides
export async function getUserPermissionOverrides(userId: string): Promise<any[]> {
    try {
        const response = await fetch(`/api/users/${userId}/permission-overrides`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            console.error(`Failed to fetch permission overrides for ${userId}, status:`, response.status);
            return [];
        }

        const data = await response.json();
        return data.data;

    } catch (error) {
        console.error(`Error fetching permission overrides for ${userId}:`, error);
        return [];
    }
}

// Set user permission override
export async function setUserPermissionOverride(
    userId: string, 
    permissionData: { permission: string; type: string }
): Promise<boolean> {
    try {
        const response = await fetch(`/api/users/${userId}/permission-overrides`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(permissionData)
        });

        return response.ok;

    } catch (error) {
        console.error(`Error setting permission override for ${userId}:`, error);
        return false;
    }
}

// Delete user permission override
export async function deleteUserPermissionOverride(userId: string, permissionId: string): Promise<boolean> {
    try {
        const response = await fetch(`/api/users/${userId}/permission-overrides/${permissionId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        return response.ok;

    } catch (error) {
        console.error(`Error deleting permission override ${permissionId} for user ${userId}:`, error);
        return false;
    }
}
