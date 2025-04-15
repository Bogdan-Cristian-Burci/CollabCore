import { Role } from '@/types/role';
import { createApiModule } from '@/lib/api-factory';
import { api } from '@/lib/fetch-interceptor';

// Create a typed API module for roles
const rolesApi = createApiModule<Role>('/api/roles');

// Custom implementation for fetchRoles to handle the specific response format
export async function fetchRoles(): Promise<Role[]> {
  try {
    console.log('Fetching roles with custom implementation');
    const response = await api.getJSON<any>('/api/roles');
    console.log('Roles API raw response:', response);
    
    // Ensure we return an array of roles
    if (response && response.roles && Array.isArray(response.roles)) {
      console.log('Found roles array in response.roles');
      return response.roles;
    }
    
    // Fallback for direct array response
    if (Array.isArray(response)) {
      console.log('Response is directly an array');
      return response;
    }
    
    // Fallback for data property
    if (response && response.data) {
      if (Array.isArray(response.data)) {
        console.log('Found array in response.data');
        return response.data;
      }
      
      // Check if data.roles exists
      if (response.data.roles && Array.isArray(response.data.roles)) {
        console.log('Found array in response.data.roles');
        return response.data.roles;
      }
    }
    
    console.warn('Unexpected response format, returning empty array:', response);
    return [];
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
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