import { Role } from '@/types/role';
import rolesApi, { 
  getRolePermissions, 
  updateRolePermissions, 
  removePermissionsFromRole,
  revertRoleToDefault
} from '@/lib/api/roles';
import { createQueryKeys } from '@/lib/api-factory';
import { createResourceHooks } from '@/lib/query-hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Create standardized query keys for roles
export const roleKeys = createQueryKeys('roles');

// Extend the query keys type to include permissions
interface RoleKeys extends ReturnType<typeof createQueryKeys> {
  permissions: (roleId: number) => readonly [string, "detail", number, "permissions"];
}

// Add custom query keys for role permissions
(roleKeys as any).permissions = (roleId: number) => [...roleKeys.detail(roleId), 'permissions'] as const;

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
  const { 
    data = [], 
    isLoading, 
    isFetching, 
    error, 
    refetch 
  } = roleHooks.useGetAll({
    // Add additional options for better reliability
    retry: 3,
    retryDelay: 1000
  });
  
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
  const queryClient = useQueryClient();
  
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

  // Mutation for reverting a role to system default
  const revertToDefaultMutation = useMutation({
    mutationFn: () => revertRoleToDefault(id),
    onSuccess: async () => {
      // Invalidate all roles queries instead of just the specific role
      // This ensures we get fresh data after role is replaced
      await queryClient.invalidateQueries({
        queryKey: roleKeys.all(),
      });
    }
  });

  return {
    role,
    isLoading,
    isFetching,
    error,
    refetch,
    updateRole,
    isUpdating,
    updateError,
    revertToDefault: revertToDefaultMutation.mutate,
    isReverting: revertToDefaultMutation.isPending,
    revertError: revertToDefaultMutation.error
  };
}

/**
 * Hook to get and update permissions for a specific role
 */
export function useRolePermissions(roleId: number, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();
  const isEnabled = options?.enabled !== undefined ? options.enabled : !!roleId;

  // Query for role permissions
  const permissionsQuery = useQuery({
    queryKey: (roleKeys as any).permissions(roleId),
    queryFn: () => getRolePermissions(roleId),
    enabled: isEnabled && !!roleId,
  });

  // Mutation to update role permissions
  const updatePermissionsMutation = useMutation({
    mutationFn: (permissions: string[]) => updateRolePermissions(roleId, permissions),
    onSuccess: async () => {
      // Invalidate both the role permissions query and the role detail query
      // Use Promise.all to wait for both queries to be invalidated
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: (roleKeys as any).permissions(roleId) }),
        queryClient.invalidateQueries({ queryKey: roleKeys.detail(roleId) })
      ]);
    },
  });

  // Mutation to remove permissions from a role
  const removePermissionsMutation = useMutation({
    mutationFn: (permissions: string[]) => removePermissionsFromRole(roleId, permissions),
    onSuccess: async () => {
      // Invalidate both the role permissions query and the role detail query
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: (roleKeys as any).permissions(roleId) }),
        queryClient.invalidateQueries({ queryKey: roleKeys.detail(roleId) })
      ]);
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
    removePermissions: removePermissionsMutation.mutate,
    isRemoving: removePermissionsMutation.isPending,
    removeError: removePermissionsMutation.error,
  };
}


// Default export for backward compatibility
export default {
  ...roleHooks,
  useRolePermissions,
};