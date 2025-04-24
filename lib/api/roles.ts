import { Role } from '@/types/role';
import { createApiModule } from '@/lib/api-factory';
import { api } from '@/lib/fetch-interceptor';
import { toast } from 'sonner';

// Create a typed API module for roles
const rolesApi = createApiModule<Role>('/api/roles');

// Fetch roles from the API
export async function fetchRoles(): Promise<Role[]> {
  try {
    // Use direct fetch which is proven to work correctly
    const response = await fetch('/api/roles');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch roles: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Handle the known response format from this API endpoint
    if (data.roles && Array.isArray(data.roles)) {
      return data.roles;
    }
    
    // Fallback logic in case the response format changes
    if (Array.isArray(data)) {
      return data;
    }
    
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    // Unexpected format, but try to handle it gracefully
    return [];
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error; // Let React Query handle the error
  }
}

// Custom role-related API functions beyond basic CRUD
export async function getRolePermissions(roleId: number): Promise<string[]> {
  try {
    // Use the role detail endpoint instead of a dedicated permissions endpoint
    const response = await api.getJSON<{role: Role}>(`/api/roles/${roleId}`);
    
    // Extract permissions from the role object
    if (response?.role?.permissions && Array.isArray(response.role.permissions)) {
      // Map permission objects to strings (display_name or name)
      return response.role.permissions.map(p => {
        if (typeof p === 'string') return p;
        if (typeof p === 'object' && p !== null) {
          return p.display_name || p.name || JSON.stringify(p);
        }
        return String(p);
      });
    }
    
    console.warn('No permissions found for role or unexpected format, returning empty array:', response);
    return [];
  } catch (error) {
    console.error(`Error fetching permissions for role ${roleId}:`, error);
    return [];
  }
}

export async function updateRolePermissions(roleId: number, permissions: string[]): Promise<boolean> {
  try {
    await api.postJSON(`/api/roles/${roleId}/permissions`, { permissions }, {
      showSuccessToast: true
    });
    return true;
  } catch (error) {
    console.error(`Error updating permissions for role ${roleId}:`, error);
    return false;
  }
}

export async function removePermissionsFromRole(roleId: number, permissions: string[]): Promise<boolean> {
  try {
    await api.deleteJSON(`/api/roles/${roleId}/permissions`, { permissions }, {
      showSuccessToast: true
    });
    return true;
  } catch (error) {
    console.error(`Error removing permissions from role ${roleId}:`, error);
    return false;
  }
}

/**
 * Revert a custom role back to system default
 */
export async function revertRoleToDefault(roleId: number): Promise<boolean> {
  try {
    await api.postJSON(`/api/roles/${roleId}/revert`, {}, {
      showSuccessToast: true
    });
    
    // Show a success toast
    toast.success("Role successfully reverted to system defaults");
    
    return true;
  } catch (error) {
    console.error(`Error reverting role ${roleId} to default:`, error);
    toast.error("Failed to revert role to system defaults");
    return false;
  }
}

// Re-export the standardized API functions with preserved names for backward compatibility
export const fetchRoleById = rolesApi.getById;
export const createRole = rolesApi.create;
export const updateRole = rolesApi.update;
export const deleteRole = rolesApi.delete;

// Export the entire API module for direct use
export default {
  ...rolesApi,
  getAll: fetchRoles, // Override the getAll method with our custom implementation
  getRolePermissions,
  updateRolePermissions,
  removePermissionsFromRole,
  revertRoleToDefault
};