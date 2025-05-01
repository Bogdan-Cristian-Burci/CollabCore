import { Permission, PermissionsApiResponse } from '@/types/permission';
import { createApiModule } from '@/lib/api-factory';
import { api } from '@/lib/fetch-interceptor';

// Custom implementation for getAll to handle the nested permissions format
async function getPermissions(): Promise<Permission[]> {
  try {
    console.log('Fetching all permissions');
    const result = await api.getJSON<PermissionsApiResponse>('/api/permissions');
    console.log('Permissions API response:', result);
    
    if (!result || !result.permissions) {
      console.error('Unexpected API response format for permissions:', result);
      return [];
    }
    
    // Handle the new nested structure where permissions are grouped by category
    if (typeof result.permissions === 'object' && !Array.isArray(result.permissions)) {
      // If permissions is an object with category keys
      const allPermissions: Permission[] = [];
      
      Object.entries(result.permissions).forEach(([category, permissions]) => {
        if (Array.isArray(permissions)) {
          const permissionsWithCategory = permissions.map(p => ({
            ...p,
            category: p.category || category // Use existing category or fallback to key
          }));
          
          allPermissions.push(...permissionsWithCategory);
        }
      });
      
      return allPermissions;
    }
    
    // If permissions is already an array
    if (Array.isArray(result.permissions)) {
      return result.permissions;
    }
    
    console.error('Could not parse permissions from API response');
    return [];
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return [];
  }
}

// Create a typed API module for permissions
const basePermissionsApi = createApiModule<Permission>('/api/permissions');

// Custom permissions API with overridden getAll method
const permissionsApi = {
  ...basePermissionsApi,
  getAll: getPermissions
};

// Re-export the standardized API functions with preserved names for backward compatibility
export const fetchPermissions = permissionsApi.getAll;
export const fetchPermissionById = permissionsApi.getById;
export const createPermission = permissionsApi.create;
export const updatePermission = permissionsApi.update;
export const deletePermission = permissionsApi.delete;

// Export the entire API module for direct use
export default permissionsApi;