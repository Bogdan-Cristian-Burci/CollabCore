import { Role } from '@/types/role';
import { createApiModule } from '@/lib/api-factory';
import { api } from '@/lib/fetch-interceptor';

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
    const response = await api.getJSON<{permissions: string[]}>(`/api/roles/${roleId}/permissions`);
    console.log('Role permissions response:', response);
    
    if (response?.permissions && Array.isArray(response.permissions)) {
      return response.permissions;
    }
    
    // Fallback for different response formats
    if (Array.isArray(response)) {
      return response;
    }
    
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    console.warn('Unexpected role permissions format, returning empty array:', response);
    return [];
  } catch (error) {
    console.error(`Error fetching permissions for role ${roleId}:`, error);
    return [];
  }
}

export async function updateRolePermissions(roleId: number, permissions: string[]): Promise<boolean> {
  try {
    await api.putJSON(`/api/roles/${roleId}/permissions`, { permissions }, {
      showSuccessToast: true
    });
    return true;
  } catch (error) {
    console.error(`Error updating permissions for role ${roleId}:`, error);
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
  updateRolePermissions
};