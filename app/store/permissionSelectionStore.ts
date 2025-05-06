import { create } from "zustand";
import { Permission } from "@/types/permission";

interface PermissionSelectionState {
  selectedPermissions: Permission[];
  openAccordionSections: string[];
  setSelectedPermissions: (permissions: Permission[]) => void;
  addPermission: (permission: Permission) => void;
  removePermission: (permissionId: number) => void;
  setOpenAccordionSections: (sections: string[]) => void;
  clearStore: () => void;
}

export const usePermissionSelectionStore = create<PermissionSelectionState>((set) => ({
  selectedPermissions: [],
  openAccordionSections: [],
  setSelectedPermissions: (permissions) => set({ selectedPermissions: permissions }),
  addPermission: (permission) => 
    set((state) => ({ 
      selectedPermissions: [...state.selectedPermissions, { ...permission, is_active: true }]
    })),
  removePermission: (permissionId) => 
    set((state) => ({ 
      selectedPermissions: state.selectedPermissions.filter(p => p.id !== permissionId)
    })),
  setOpenAccordionSections: (sections) => set({ openAccordionSections: sections }),
  clearStore: () => set({ selectedPermissions: [], openAccordionSections: [] })
}));