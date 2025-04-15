import { useQueryClient } from '@tanstack/react-query';
import { OrganisationResource } from '@/types/organisation';
import { useOrganizationStore } from '@/app/store/organisationStore';
import organisationsApi from '@/lib/api/organisations';
import { createQueryKeys } from '@/lib/api-factory';
import { createResourceHooks } from '@/lib/query-hooks';

// Create standardized query keys for organizations
export const organizationKeys = createQueryKeys('organizations');

// Create standardized hooks for organizations
const organizationHooks = createResourceHooks<OrganisationResource>(
  'organizations',
  organisationsApi,
  {
    all: organizationKeys.all,
    detail: (id) => organizationKeys.detail(id)
  }
);

/**
 * Hook to fetch and manage all organizations data
 */
export function useOrganizations() {
  const queryClient = useQueryClient();
  const { setCurrentOrganization } = useOrganizationStore();
  
  // Use the standardized hook
  const { 
    data = [], 
    isLoading, 
    isFetching, 
    error, 
    refetch 
  } = organizationHooks.useGetAll();

  // Set active organization and update the store (business logic specific to organizations)
  const setActiveOrganization = async (orgId: string) => {
    // Update store (persists in localStorage)
    await setCurrentOrganization(orgId);
    
    // Refetch if needed to ensure data consistency
    if (data.length === 0) {
      refetch();
    }

    // Emit an event for other parts of the app to respond
    window.dispatchEvent(new CustomEvent('organizationChanged', {
      detail: { organizationId: orgId }
    }));
  };

  // Find the active organization (business logic specific to organizations)
  const getActiveOrganization = (): OrganisationResource | null => {
    const store = useOrganizationStore.getState();
    const activeOrgId = store.currentOrganizationId;
    
    if (!activeOrgId || !data) return null;
    
    return data.find(org => org.id === activeOrgId) || null;
  };

  return {
    organizations: data,
    isLoading,
    isFetching,
    error,
    refetch,
    setActiveOrganization,
    getActiveOrganization,
  };
}

/**
 * Hook to fetch and manage a single organization by ID
 */
export function useOrganization(id: string) {
  return organizationHooks.useGetById(id);
}

// Export the raw hooks for direct use
export default organizationHooks;