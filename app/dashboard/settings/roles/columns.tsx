"use client";

import { useState, useEffect } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { UserResource } from "@/types/user";
import { Role } from "@/types/role";
import { useOrganizationStore } from "@/app/store/organisationStore";
import { fetchRoles } from "@/lib/api/roles";
import { updateUserRoleInOrganization } from "@/lib/api/users";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";

export const columns: ColumnDef<UserResource>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            // Make only the first cell (name) expand the row when clicked
            return (
                <div 
                    className="flex items-center cursor-pointer" 
                    onClick={() => {
                        const rowId = row.id as string;
                        // Trigger row expansion - this matches the implementation in data-table.tsx
                        document.dispatchEvent(new CustomEvent('expandRow', { detail: { rowId } }));
                    }}
                >
                    {row.getValue("name")}
                </div>
            );
        },
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "roles",
        header: "Role",
        cell: ({ row }) => {
            const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
            const [isLoading, setIsLoading] = useState(false);
            const [selectedRole, setSelectedRole] = useState<string>("");
            const currentOrganizationId = useOrganizationStore(state => state.currentOrganizationId);
            const userId = row.original.id;
            const roles = row.getValue("roles");
            
            // Load available roles
            useEffect(() => {
                const loadRoles = async () => {
                    setIsLoading(true);
                    try {
                        const rolesList = await fetchRoles();
                        setAvailableRoles(rolesList);
                    } catch (error) {
                        console.error('Failed to load roles:', error);
                    } finally {
                        setIsLoading(false);
                    }
                };
                
                loadRoles();
            }, []);
            
            // Set initial selected role from user
            useEffect(() => {
                if (Array.isArray(roles) && roles.length > 0) {
                    const currentRole = roles[0];
                    setSelectedRole(typeof currentRole === 'object' ? currentRole.name : currentRole);
                } else if (!Array.isArray(roles) && roles) {
                    setSelectedRole(typeof roles === 'object' ? 'Complex Role' : String(roles));
                }
            }, [roles]);
            
            const handleRoleChange = async (value: string) => {
                if (!currentOrganizationId) {
                    toast.error("Organization ID not found");
                    return;
                }
                
                setIsLoading(true);
                try {
                    const success = await updateUserRoleInOrganization(
                        currentOrganizationId,
                        userId,
                        value
                    );
                    
                    if (success) {
                        setSelectedRole(value);
                        toast.success(`Role updated to ${value}`);
                        
                        // Refresh user permissions
                        // 1. Invalidate the user permissions query cache
                        const queryClient = window.queryClient;
                        if (queryClient) {
                            // Invalidate the specific user's permissions cache
                            queryClient.invalidateQueries({ queryKey: ['user', userId.toString(), 'permissions'] });
                            
                            // Also invalidate the users list to update role display
                            queryClient.invalidateQueries({ queryKey: ['users', 'organization'] });
                        } else {
                            // Fallback: Dispatch a custom event to trigger the UserPermissions component to refetch
                            document.dispatchEvent(new CustomEvent('refreshUserPermissions', { detail: { userId: userId.toString() } }));
                        }
                    } else {
                        toast.error("Failed to update role");
                    }
                } catch (error) {
                    console.error('Error updating role:', error);
                    toast.error("Error updating role");
                } finally {
                    setIsLoading(false);
                }
            };
            
            // If roles aren't in the expected format, show a fallback
            if (!Array.isArray(roles) && typeof roles !== 'string') {
                return (
                    <div className="flex flex-wrap gap-2">
                        <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded">
                            {typeof roles === 'object' ? 'Complex Role' : String(roles || 'No Role')}
                        </span>
                    </div>
                );
            }
            
            return (
                <div onClick={(e) => e.stopPropagation()}>
                    <Select
                        value={selectedRole}
                        onValueChange={handleRoleChange}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableRoles.map((role) => (
                                <SelectItem key={role.id} value={role.name}>
                                    {role.display_name || role.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            );
        },
    },
];
