import { Permission } from '@/types/permission';
import permissionsApi from '@/lib/api/permissions';
import { createQueryKeys } from '@/lib/api-factory';
import { createResourceHooks } from '@/lib/query-hooks';

// Create standardized query keys for permissions
export const permissionKeys = createQueryKeys('permissions');

// Create standardized hooks for permissions
const permissionHooks = createResourceHooks<Permission>(
  'permissions',
  permissionsApi,
  {
    all: permissionKeys.all,
    detail: (id) => permissionKeys.detail(id)
  }
);

/**
 * Hook to fetch and manage all permissions data
 */
export function usePermissions() {
  const { 
    data = [], 
    isLoading, 
    error, 
    refetch 
  } = permissionHooks.useGetAll();

  return {
    permissions: data,
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook to fetch and manage a single permission by ID
 */
export function usePermission(id: number) {
  return permissionHooks.useGetById(id);
}

// Export the raw hooks for direct use
export default permissionHooks;