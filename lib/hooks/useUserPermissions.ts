import { useQuery } from '@tanstack/react-query';
import { UserResource } from '@/types/user';

/**
 * Hook to fetch the current user's permissions
 */
export function useUserPermissions() {
  return useQuery<UserResource>({
    queryKey: ['current-user', 'permissions'],
    queryFn: async () => {
      const response = await fetch('/api/user?include=permissions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user permissions');
      }

      return response.json();
    },
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false
  });
}

export default useUserPermissions;