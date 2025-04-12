import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchUserProfile, switchOrganisation } from '@/lib/api/users';
import { UserResource } from "@/types/user";

interface UserState {
    user: UserResource | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchUserProfile: () => Promise<UserResource | null>;
    switchUserOrganisation: (organisationId: string) => Promise<boolean>;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,
            isLoading: false,
            error: null,

            fetchUserProfile: async () => {
                set({ isLoading: true, error: null });
                try {
                    const user = await fetchUserProfile();
                    set({
                        user,
                        isLoading: false
                    });
                    return user;
                } catch (error) {
                    set({ error: 'Failed to fetch user profile', isLoading: false });
                    return null;
                }
            },

            switchUserOrganisation: async (organisationId) => {
                set({ isLoading: true, error: null });
                try {
                    const success = await switchOrganisation(organisationId);
                    if (success) {
                        // When organization is switched, we need to refresh the user profile
                        await get().fetchUserProfile();
                        
                        // Trigger event for other parts of the app
                        window.dispatchEvent(new CustomEvent('userOrganizationChanged', {
                            detail: { organisationId }
                        }));
                    }
                    set({ isLoading: false });
                    return success;
                } catch (error) {
                    set({ error: 'Failed to switch organization', isLoading: false });
                    return false;
                }
            }
        }),
        {
            name: 'user-storage',
            partialize: (state) => ({
                user: state.user
            }),
        }
    )
);
