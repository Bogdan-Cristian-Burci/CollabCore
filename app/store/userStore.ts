import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchUserProfile, switchOrganisation } from '@/lib/api/users';
import { UserResource } from "@/types/user";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  initials: string;
  permissions: string[];
  roles: string[];
  permission_overrides: {
    grant: string[];
    deny: string[];
  };
  organisation_id: number;
}

interface UserState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUserProfile: () => Promise<UserResource | null>;
  switchUserOrganisation: (organisationId: string) => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
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
          const userData = await fetchUserProfile();
          if (userData) {
            const authUser: AuthUser = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              initials: userData.initials,
              permissions: userData.permissions,
              roles: userData.roles,
              permission_overrides: userData.permission_overrides,
              organisation_id: userData.organisation_id,
            };
            set({
              user: authUser,
              isLoading: false
            });
          }
          return userData;
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
      },

      hasPermission: (permission) => {
        const user = get().user;
        if (!user) return false;
        
        // Check permission overrides first
        if (user.permission_overrides.deny.includes(permission)) {
          return false;
        }
        
        if (user.permission_overrides.grant.includes(permission)) {
          return true;
        }
        
        // Check regular permissions
        return user.permissions.includes(permission);
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