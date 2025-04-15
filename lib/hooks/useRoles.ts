import { Role } from '@/types/role';
import rolesApi, { getRolePermissions, updateRolePermissions } from '@/lib/api/roles';
import { createQueryKeys } from '@/lib/api-factory';
import { createResourceHooks } from '@/lib/query-hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Create standardized query keys for roles
export const roleKeys = createQueryKeys('roles');

// Add custom query keys for role permissions
roleKeys.permissions = (roleId: number) => [...roleKeys.detail(roleId), 'permissions'] as const;

// Create standardized hooks for roles
const roleHooks = createResourceHooks<Role>(
  'roles',
  rolesApi,
  {
    all: roleKeys.all,
    detail: (id) => roleKeys.detail(id)
  }
);

/**
 * Hook to fetch and manage all roles data
 */
export function useRoles() {
  const { data = [], isLoading, isFetching, error, refetch } = roleHooks.useGetAll();
  const { mutate: createRole, isPending: isCreating, error: createError } = roleHooks.useCreate();
  const { mutate: deleteRoleMutation, isPending: isDeleting, error: deleteError } = roleHooks.useDelete();

  // Wrap delete mutation to match previous API
  const deleteRole = (id: number) => deleteRoleMutation(id);

  return {
    roles: data,
    isLoading,
    isFetching,
    error,
    refetch,
    createRole,
    isCreating,
    createError,
    deleteRole,
    isDeleting,
    deleteError,
  };
}

/**
 * Hook to fetch and manage a single role by ID
 */
export function useRole(id: number) {
  const { 
    data: role, 
    isLoading, 
    isFetching, 
    error, 
    refetch 
  } = roleHooks.useGetById(id);
  
  const { 
    mutate: updateRoleMutation, 
    isPending: isUpdating, 
    error: updateError 
  } = roleHooks.useUpdate();

  // Wrap update mutation to match previous API
  const updateRole = (data: Partial<Role>) => updateRoleMutation({ id, data });

  return {
    role,
    isLoading,
    isFetching,
    error,
    refetch,
    updateRole,
    isUpdating,
    updateError,
  };
}

/**
 * Hook to get and update permissions for a specific role
 */
export function useRolePermissions(roleId: number) {
  const queryClient = useQueryClient();

  // Query for role permissions
  const permissionsQuery = useQuery({
    queryKey: roleKeys.permissions(roleId),
    queryFn: () => getRolePermissions(roleId),
    enabled: !!roleId,
  });

  // Mutation to update role permissions
  const updatePermissionsMutation = useMutation({
    mutationFn: (permissions: string[]) => updateRolePermissions(roleId, permissions),
    onSuccess: () => {
      // Invalidate both the role permissions query and the role detail query
      queryClient.invalidateQueries({ queryKey: roleKeys.permissions(roleId) });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(roleId) });
    },
  });

  return {
    permissions: permissionsQuery.data || [],
    isLoading: permissionsQuery.isLoading,
    error: permissionsQuery.error,
    refetch: permissionsQuery.refetch,
    updatePermissions: updatePermissionsMutation.mutate,
    isUpdating: updatePermissionsMutation.isPending,
    updateError: updatePermissionsMutation.error,
  };
}

// Export the raw hooks for direct use
export default {
  ...roleHooks,
  useRolePermissions,
};