"use client";

import React, {useCallback, useEffect} from "react";
import {Role} from "@/types/role";
import {Permission} from "@/types/permission";
import {Accordion, AccordionItem, AccordionTrigger, AccordionContent} from "@/components/ui/accordion";
import SwitchButton from "@/components/dashboard/SwitchButton";
import {useRolePermissions, useRole} from "@/lib/hooks/useRoles";
import { toast } from "sonner";


export const RoleDetailedListCard : React.FC<{item:Role}> = ({item}) => {

    const [permissions, setPermissions] = React.useState<Permission[]>([...item.permissions]);
    const [hasChanges, setHasChanges] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isReverting, setIsReverting] = React.useState(false);
    
    // Get role permissions hook functions
    const { updatePermissions, removePermissions } = useRolePermissions(item.id);
    
    // Get role hooks for revert functionality
    const { revertToDefault } = useRole(item.id);

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


    const handlePermissionChange = useCallback((permissionId: number, isActive: boolean) => {
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
            
            console.log("Permissions to add:", permissionsToAdd);
            console.log("Permissions to remove:", permissionsToRemove);
            
            // Perform API calls to add and remove permissions
            const promises = [];
            
            if (permissionsToAdd.length > 0) {
                console.log(`Adding ${permissionsToAdd.length} permissions`);
                promises.push(updatePermissions(permissionsToAdd));
            }
            
            if (permissionsToRemove.length > 0) {
                console.log(`Removing ${permissionsToRemove.length} permissions`);
                promises.push(removePermissions(permissionsToRemove));
            }
            
            // Wait for all API calls to complete
            await Promise.all(promises);
            
            console.log("All API calls completed successfully");
            toast.success(`${permissionsToAdd.length + permissionsToRemove.length} permissions updated successfully`);
            setHasChanges(false);
        } catch (error) {
            console.error("Error updating permissions:", error);
            toast.error("Failed to update permissions");
        } finally {
            setIsSaving(false);
        }
    };

    // Cancel changes
    const cancelChanges = () => {
        setPermissions([...item.permissions]);
        setHasChanges(false);
    };
    
    // Revert role to system default
    const handleRevert = async () => {
        if (window.confirm("Are you sure you want to revert this role to system defaults? All custom permission settings will be lost.")) {
            try {
                setIsReverting(true);
                await revertToDefault();
                toast.success("Role has been reverted to system defaults");
            } catch (error) {
                console.error("Error reverting role:", error);
                toast.error("Failed to revert role to system defaults");
            } finally {
                setIsReverting(false);
            }
        }
    };

    return(
        <div className="h-full flex flex-col relative pt-8"> {/* Added pt-8 to leave space for parent close button */}
            {/* Sticky header with save/cancel buttons - positioned below the parent close button */}
            {hasChanges && (
                <div className="sticky top-12 z-40 bg-white dark:bg-gray-950 shadow-md p-3 mb-4 rounded-md flex justify-between items-center">
                    <div className="text-sm">
                        <span className="font-medium">Unsaved changes</span>
                        <p className="text-muted-foreground">
                            You have made {getChangedPermissionsCount()} permission changes that are not saved
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={cancelChanges}
                            disabled={isSaving}
                            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={saveChanges}
                            disabled={isSaving}
                            className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors flex items-center gap-1"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                        </button>
                    </div>
                </div>
            )}

            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold">{item.display_name}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                
                {/* Show revert button for system roles that have been customized */}
                {((item.is_system || item.is_system_role) && item.is_customized) && (
                    <button 
                        onClick={handleRevert}
                        disabled={isReverting || isSaving}
                        className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-md transition-colors flex items-center gap-1"
                        title="Revert this role back to system defaults"
                    >
                        {isReverting ? (
                            <>
                                <svg className="animate-spin h-3 w-3 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Reverting...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Reset to Default
                            </>
                        )}
                    </button>
                )}
            </div>
            <Accordion type="single" collapsible className="w-full">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                    <AccordionItem value={category} key={category}>
                        <AccordionTrigger className="cursor-pointer">{category}</AccordionTrigger>
                        <AccordionContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {permissions.map((permission) => {
                                        // Find the current state of this permission in our local state
                                        const permState = permissions.find(p => p.id === permission.id);
                                        // Find original state to determine if it's changed
                                        const originalState = item.permissions.find(p => p.id === permission.id);
                                        const hasChanged = permState?.is_active !== originalState?.is_active;
                                        
                                        return (
                                            <div key={permission.id} 
                                                className={`p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow ${
                                                    hasChanged ? 'border-blue-500 bg-blue-50' : ''
                                                }`}
                                            >
                                                <h5 className="font-medium text-md">{permission.display_name}</h5>
                                                <p className="text-sm text-muted-foreground">{permission.description}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-sm font-medium">
                                                        {permState?.is_active ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                    <SwitchButton
                                                        className="cursor-pointer"
                                                        checked={permState?.is_active || false}
                                                        onChange={value => handlePermissionChange(permission.id, value)} 
                                                        disabled={isSaving}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}