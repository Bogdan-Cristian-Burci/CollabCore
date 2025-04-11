import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchOrganizations } from '@/lib/api/organisations';
import {OrganisationResource} from "@/types/organisation";

interface OrganizationState {
    organizations: OrganisationResource[];
    currentOrganization: OrganisationResource | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchUserOrganizations: () => Promise<void>;
    setCurrentOrganization: (orgId: string) => Promise<void>;
}

export const useOrganizationStore = create<OrganizationState>()(
    persist(
        (set, get) => ({
            organizations: [],
            currentOrganization: null,
            isLoading: false,
            error: null,

            fetchUserOrganizations: async () => {
                set({ isLoading: true, error: null });
                try {
                    const organisations = await fetchOrganizations();
                    set({
                        organizations: organisations,
                        // Auto-select first org if none is selected
                        currentOrganization: get().currentOrganization || organisations.find(org => org.is_active) || null,
                        isLoading: false
                    });
                } catch (error) {
                    set({ error: 'Failed to fetch organizations', isLoading: false });
                }
            },

            setCurrentOrganization: async (orgId) => {
                const organization = get().organizations.find(org => org.is_active);
                if (!organization) return;

                set({ currentOrganization: organization });
                // We'll emit an event for other stores to listen to
                window.dispatchEvent(new CustomEvent('organizationChanged', {
                    detail: { organizationId: orgId }
                }));
            }
        }),
        {
            name: 'org-storage',
            // Only persist the currentOrganization ID, not the full object
            partialize: (state) => ({
                currentOrganization: state.currentOrganization
            }),
        }
    )
);