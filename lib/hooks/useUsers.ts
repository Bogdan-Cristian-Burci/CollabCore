import { useQuery } from '@tanstack/react-query';
import { UserResource } from '@/types/user';
import { getUsersByOrganization, getUserWithPermissions } from '@/lib/api/users';
import { useOrganizationStore } from '@/app/store/organisationStore';

/**
 * Hook to fetch and manage users from the logged user's organization
 */
export function useUsers() {
  // Get the current organization ID from the store
  const currentOrganization = useOrganizationStore(state => state.getCurrentOrganization());
  const organisationId = currentOrganization?.id;

  // Use React Query to fetch users with the organization ID
  const {
    data = [],
    isLoading,
    isFetching,
    error,
    refetch
  } = useQuery<UserResource[]>({
    queryKey: ['users', 'organization', organisationId], // Remove the timestamp to avoid continuous refetching
    queryFn: () => {
      if (!organisationId) return Promise.resolve([]);
      return getUsersByOrganization(organisationId);
    },
    enabled: !!organisationId, // Only run the query if we have an organization ID
    staleTime: 60000, // Consider data fresh for 1 minute
    refetchOnMount: 'always', // Always refetch on mount
    refetchOnWindowFocus: false, // Don't refetch when window gets focus
    retry: 3, // Retry failed requests 3 times
  });

  return {
    users: data,
    isLoading,
    isFetching,
    error,
    refetch
  };
}

/**
 * Hook to fetch user with their permissions
 */
export function useUserPermissions(userId: number | string | null) {
  return useQuery<UserResource | null>({
    queryKey: ['user', userId, 'permissions'],
    queryFn: () => {
      if (!userId) return Promise.resolve(null);
      return getUserWithPermissions(userId.toString());
    },
    enabled: !!userId, // Only run the query if we have a userId
    staleTime: 300000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export default useUsers;