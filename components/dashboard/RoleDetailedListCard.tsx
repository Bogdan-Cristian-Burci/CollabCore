"use client";

import React, {useCallback, useEffect} from "react";
import {Role} from "@/types/role";
import {Permission} from "@/types/permission";
import PermissionAccordion from "@/components/dashboard/PermissionAccordion";
import {useRolePermissions, useRoles} from "@/lib/hooks/useRoles";
import {Button} from "@/components/ui/button";



export const RoleDetailedListCard : React.FC<{item:Role}> = ({item}) => {

    const [permissions, setPermissions] = React.useState<Permission[]>([...item.permissions]);
    const [hasChanges, setHasChanges] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    
    // Get role permissions hook functions
    const { updatePermissions, removePermissions, refetch: refetchPermissions } = useRolePermissions(item.id);
    
    // Get global roles refetch function
    const { refetch: refetchAllRoles } = useRoles();

    useEffect(() => {
        setPermissions([...item.permissions]);
        setHasChanges(false);
    }, [item]);

    // Group permissions from our local state, not from the original item
    const groupedPermissions = permissions.reduce((acc, permission) => {
        const category = permission.category || "Uncategorized";
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);


    const handlePermissionChange = useCallback((permissionId: number, isActiveOrRevert: boolean | 'revert') => {
        // Support for 'revert' was added to match the PermissionAccordion interface
        // However, role permissions don't have individual overrides, so we only handle boolean values
        if (isActiveOrRevert === 'revert') {
            console.warn('Revert action is not applicable for role permissions');
            return;
        }
        
        const isActive = isActiveOrRevert as boolean;
        console.log(`Permission change: ${permissionId} => ${isActive ? 'active' : 'inactive'}`);
        
        setPermissions(prev => {
            // Find the permission that changed and log its current state
            const permToChange = prev.find(p => p.id === permissionId);
            console.log(`Changing permission ${permToChange?.name} from ${permToChange?.is_active} to ${isActive}`);
            
            const updated = prev.map(p =>
                p.id === permissionId ? { ...p, is_active: isActive } : p
            );

            // Check if current permissions differ from original
            const hasUnsavedChanges = updated.some(p => {
                const originalPerm = item.permissions.find(op => op.id === p.id);
                return originalPerm?.is_active !== p.is_active;
            });

            console.log(`Has unsaved changes: ${hasUnsavedChanges}`);
            setHasChanges(hasUnsavedChanges);
            return updated;
        });
    }, [item.permissions]);

    // Get count of changed permissions for the UI
    const getChangedPermissionsCount = () => {
        let count = 0;
        permissions.forEach(p => {
            const originalPerm = item.permissions.find(op => op.id === p.id);
            if (originalPerm?.is_active !== p.is_active) {
                count++;
            }
        });
        return count;
    };

    // Save changes
    const saveChanges = async () => {
        try {
            console.log("Saving changes...");
            setIsSaving(true);
            
            // Separate permissions that need to be added vs removed
            const permissionsToAdd: string[] = [];
            const permissionsToRemove: string[] = [];
            
            permissions.forEach(p => {
                const originalPerm = item.permissions.find(op => op.id === p.id);
                
                // If permission state has changed
                if (originalPerm?.is_active !== p.is_active) {
                    // If permission is now active, it needs to be added
                    if (p.is_active) {
                        permissionsToAdd.push(p.name);
                    } 
                    // If permission is now inactive, it needs to be removed
                    else {
                        permissionsToRemove.push(p.name);
                    }
                }
            });
            
            // Perform API calls to add and remove permissions
            const promises = [];
            
            if (permissionsToAdd.length > 0) {
                promises.push(updatePermissions(permissionsToAdd));
            }
            
            if (permissionsToRemove.length > 0) {
                promises.push(removePermissions(permissionsToRemove));
            }
            
            // Wait for all API calls to complete
            await Promise.all(promises);

            // Refresh data to show current permissions state
            await Promise.all([
                refetchPermissions(),
                refetchAllRoles()
            ]);

            setHasChanges(false);
        } catch (error) {
            console.error("Error updating permissions:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Cancel changes
    const cancelChanges = () => {
        setPermissions([...item.permissions]);
        setHasChanges(false);
    };

    return(
        <div className="h-full flex flex-col relative pt-8"> {/* Added pt-8 to leave space for parent close button */}
            {/* Sticky header with save/cancel buttons - positioned below the parent close button */}
            {hasChanges && (
                <div className="sticky top-12 z-40 bg-background shadow-md p-3 mb-4 rounded-md flex justify-between items-center">
                    <div className="text-sm">
                        <span className="font-medium">Unsaved changes</span>
                        <p className="text-muted-foreground">
                            You have made {getChangedPermissionsCount()} permission changes that are not saved
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={cancelChanges}
                            disabled={isSaving}
                            variant="outline"
                            className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={saveChanges}
                            disabled={isSaving}
                            className="px-4 py-2 text-sm bg-primary hover:bg-primary/80 text-primary-foreground rounded-md transition-colors flex items-center gap-1"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    Save Changes ({getChangedPermissionsCount()})
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-lg font-semibold">{item.display_name}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <PermissionAccordion 
                groupedPermissions={groupedPermissions}
                compareWith={item}
                isSaving={isSaving}
                handlePermissionChange={handlePermissionChange}
            />
        </div>
    )
}