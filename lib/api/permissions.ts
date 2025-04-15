import { Permission } from '@/types/permission';
import { createApiModule } from '@/lib/api-factory';

// Create a typed API module for permissions
const permissionsApi = createApiModule<Permission>('/api/permissions');

// Re-export the standardized API functions with preserved names for backward compatibility
export const fetchPermissions = permissionsApi.getAll;
export const fetchPermissionById = permissionsApi.getById;
export const createPermission = permissionsApi.create;
export const updatePermission = permissionsApi.update;
export const deletePermission = permissionsApi.delete;

// Export the entire API module for direct use
export default permissionsApi;