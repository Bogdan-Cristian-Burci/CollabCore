import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchOrganizations } from '@/lib/api/organisations';
import { OrganisationResource } from "@/types/organisation";

interface MinimalOrganisation {
  id: number;
  name: string;
  unique_id: string;
  is_active: boolean;
}

interface OrganizationState {
  organizations: MinimalOrganisation[];
  currentOrganizationId: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUserOrganizations: () => Promise<void>;
  setCurrentOrganization: (orgId: string) => Promise<void>;
  getCurrentOrganization: () => MinimalOrganisation | null;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      organizations: [],
      currentOrganizationId: null,
      isLoading: false,
      error: null,

      fetchUserOrganizations: async () => {
        set({ isLoading: true, error: null });
        try {
          const organisations = await fetchOrganizations();
          
          // Store only the minimal required data
          const minimalOrgs = organisations.map(org => ({
            id: org.id,
            name: org.name,
            unique_id: org.unique_id,
            is_active: org.is_active
          }));
          
          // Find active organization
          const activeOrg = organisations.find(org => org.is_active);
          
          set({
            organizations: minimalOrgs,
            currentOrganizationId: activeOrg?.id || null,
            isLoading: false
          });
        } catch (error) {
          set({ error: 'Failed to fetch organizations', isLoading: false });
        }
      },

      setCurrentOrganization: async (orgId) => {
        set({ currentOrganizationId: Number(orgId) });
        
        // Emit an event for other parts of the app to respond
        window.dispatchEvent(new CustomEvent('organizationChanged', {
          detail: { organizationId: orgId }
        }));
      },
      
      getCurrentOrganization: () => {
        const { organizations, currentOrganizationId } = get();
        return organizations.find(org => org.id === currentOrganizationId) || null;
      }
    }),
    {
      name: 'org-storage',
      partialize: (state) => ({
        currentOrganizationId: state.currentOrganizationId,
        organizations: state.organizations
      }),
    }
  )
);