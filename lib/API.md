# API Access Pattern Documentation

This document outlines the standardized approach for API access in the Collab Core application.

## Architecture Overview

Our API access follows a layered approach:

1. **Next.js API Routes**: Act as a secure proxy between the frontend and the backend API
2. **Resource API Modules**: Encapsulate API operations for specific resources
3. **React Query Hooks**: Provide reactive data fetching with caching and state management

## API Routes

### Standard CRUD Routes

API routes are defined in `/app/api/[resource]/route.ts` and serve as proxies to our backend:

- They authenticate requests using Next.js session
- They handle common error scenarios
- They abstract backend URLs from the frontend

Example:
```typescript
// app/api/users/route.ts
export async function GET() {
  return proxyRequest(
    new Request(`${getApiBaseUrl()}/dummy`, { method: "GET" }),
    "/api/users",
    {
      method: "GET",
      customErrorMessage: "Failed to fetch users"
    }
  );
}
```

### Custom Routes

For custom routes that aren't standard CRUD operations, create dedicated route files using dynamic segments:

```typescript
// app/api/roles/[id]/permissions/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const roleId = params.id;
  
  return proxyRequest(
    new Request(`${getApiBaseUrl()}/dummy`, { method: "GET" }),
    `/api/roles/${roleId}/permissions`,
    {
      method: "GET",
      customErrorMessage: `Failed to fetch permissions for role ${roleId}`
    }
  );
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const roleId = params.id;
  
  return proxyRequest(
    request,
    `/api/roles/${roleId}/permissions`,
    {
      method: "PUT",
      successMessage: "Role permissions updated successfully"
    }
  );
}
```

## Resource API Modules

### Standard CRUD API Modules

Resource API modules are defined in `/lib/api/[resource].ts` using our API factory:

```typescript
// lib/api/users.ts
import { User } from '@/types/user';
import { createApiModule } from '@/lib/api-factory';

// Create a typed API module for users
const usersApi = createApiModule<User>('/api/users');

// Re-export for backward compatibility
export const fetchUsers = usersApi.getAll;
export const fetchUserById = usersApi.getById;
export const createUser = usersApi.create;
export const updateUser = usersApi.update;
export const deleteUser = usersApi.delete;

// Export the entire API module
export default usersApi;
```

### Custom API Methods

For custom API endpoints, add dedicated functions to the resource API module:

```typescript
// Custom methods for non-standard endpoints
export async function getRolePermissions(roleId: number): Promise<string[]> {
  try {
    const response = await api.getJSON<{permissions: string[]}>(`/api/roles/${roleId}/permissions`);
    
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

// Export all methods including custom ones
export default {
  ...rolesApi,
  getAll: fetchRoles,
  getRolePermissions,
  updateRolePermissions
};
```

## React Query Hooks

### Standard CRUD Hooks

React Query hooks are defined in `/lib/hooks/use[Resource].ts` using our hooks factory:

```typescript
// lib/hooks/useUsers.ts
import { User } from '@/types/user';
import usersApi from '@/lib/api/users';
import { createQueryKeys } from '@/lib/api-factory';
import { createResourceHooks } from '@/lib/query-hooks';

// Create query keys
export const userKeys = createQueryKeys('users');

// Create hooks
const userHooks = createResourceHooks<User>(
  'users',
  usersApi,
  {
    all: userKeys.all,
    detail: (id) => userKeys.detail(id)
  }
);

// Export standard hooks with business logic
export function useUsers() {
  const { data = [], ...rest } = userHooks.useGetAll();
  return { users: data, ...rest };
}

export function useUser(id: string) {
  return userHooks.useGetById(id);
}

// Export raw hooks
export default userHooks;
```

### Custom API Hooks

For custom API endpoints, add dedicated query hooks:

```typescript
// Add custom query keys
roleKeys.permissions = (roleId: number) => [...roleKeys.detail(roleId), 'permissions'] as const;

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

// Export all hooks including custom ones
export default {
  ...roleHooks,
  useRolePermissions,
};
```

## Component Usage

### Using Standard Hooks

```typescript
function UsersList() {
  const { users, isLoading, error } = useUsers();
  
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Using Custom Hooks

```typescript
function RolePermissionsEditor({ roleId }) {
  const { 
    permissions, 
    isLoading, 
    error, 
    updatePermissions, 
    isUpdating 
  } = useRolePermissions(roleId);

  const handleSave = (updatedPermissions) => {
    updatePermissions(updatedPermissions);
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {/* Permissions editor UI */}
      <button 
        onClick={() => handleSave(selectedPermissions)}
        disabled={isUpdating}
      >
        {isUpdating ? "Saving..." : "Save Permissions"}
      </button>
    </div>
  );
}
```

## Utils and Factories

### 1. fetchWithInterceptor

The core fetch utility with authentication, error handling, and toast notifications:

- Automatically handles auth tokens
- Handles error notifications
- Includes CSRF protection
- Parses API responses with multiple formats

### 2. createApiModule

Factory function that creates standardized API modules for resources:

- Standard CRUD operations
- Consistent error handling
- Typed responses
- Detailed logging

### 3. createQueryKeys

Factory function that creates consistent query key structures for React Query:

- Standardized caching keys
- Support for nested resources
- Support for filters and pagination

### 4. createResourceHooks

Factory function that creates standardized React Query hooks:

- CRUD operations with proper cache invalidation
- Loading, error, and success states
- Type safety
- Optimistic updates