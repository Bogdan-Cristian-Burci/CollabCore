import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOrganizations, fetchOrganisationById } from '@/lib/api/organisations';
import { useOrganizationStore } from '@/app/store/organisationStore';
import { OrganisationResource } from '@/types/organisation';

// Key factory for query keys
const organizationKeys = {
  all: ['organizations'] as const,
  byId: (id: string) => [...organizationKeys.all, 'byId', id] as const,
};

/**
 * Hook to fetch and manage all organizations data
 */
export function useOrganizations() {
  const queryClient = useQueryClient();
  const { setCurrentOrganization } = useOrganizationStore();

  // Fetch all organizations
  const query = useQuery({
    queryKey: organizationKeys.all,
    queryFn: fetchOrganizations,
  });

  // Set active organization and update the store
  const setActiveOrganization = async (orgId: string) => {
    // Update store (persists in localStorage)
    await setCurrentOrganization(orgId);
    
    // Refetch if needed to ensure data consistency
    if (query.data?.length === 0 || !query.data) {
      query.refetch();
    }

    // Emit an event for other parts of the app to respond
    window.dispatchEvent(new CustomEvent('organizationChanged', {
      detail: { organizationId: orgId }
    }));
  };

  // Find the active organization
  const getActiveOrganization = (): OrganisationResource | null => {
    const store = useOrganizationStore.getState();
    const activeOrgId = store.currentOrganizationId;
    
    if (!activeOrgId || !query.data) return null;
    
    return query.data.find(org => org.id === activeOrgId) || null;
  };

  return {
    organizations: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    setActiveOrganization,
    getActiveOrganization,
  };
}

/**
 * Hook to fetch and manage a single organization by ID
 */
export function useOrganization(id: string) {
  return useQuery({
    queryKey: organizationKeys.byId(id),
    queryFn: () => fetchOrganisationById(id),
    enabled: !!id,
  });
}