import {Role} from "@/types/role";
import React from "react";
import {Badge} from "@/components/ui/badge";
import {AnimatedButton} from "@/components/dashboard/AnimatedButton";
import {RotateCcw, Trash2} from "lucide-react";
import {useRole, useRoles} from "@/lib/hooks/useRoles";

interface RoleSimpleCardProps {
    item: Role;
}

export const RoleSimpleCard: React.FC<RoleSimpleCardProps> = ({item}) => {
    const { revertToDefault, isReverting } = useRole(item.id);
    const { deleteRole, isDeleting, refetch } = useRoles();

    const handleRevert = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card selection when clicking the button
        if (window.confirm("Are you sure you want to revert this role to system defaults? All custom permission settings will be lost.")) {
            try {
                await revertToDefault();
                // Refetch all roles data
                await refetch();
                
                // Force page reload to ensure UI is refreshed completely
                window.location.reload();
            } catch (error) {
                console.error("Error reverting role:", error);
                alert("Failed to revert role. Please try again.");
            }
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card selection when clicking the button
        if (window.confirm("Are you sure you want to delete this role? This action cannot be undone.")) {
            try {
                await deleteRole(item.id);
                // Refetch all roles data
                await refetch();
                
                // Force page reload to ensure UI is refreshed completely
                window.location.reload();
            } catch (error) {
                console.error("Error deleting role:", error);
                alert("Failed to delete role. Please try again.");
            }
        }
    };

    return(
        <div className="flex items-center justify-between">
            <h3 className="">{item.display_name}</h3>
            <Badge>{item.is_system_role ? "System" : "Custom"}</Badge>
            {/* Show reset button for custom roles that override system templates */}
            {item.overrides_system && (
                <AnimatedButton
                    onClick={handleRevert}
                    disabled={isReverting}
                    text={isReverting ? "..." : ""}
                    icon={RotateCcw}
                />
            )}
            
            {/* Show delete button for user-created custom roles that don't override system roles */}
            {!item.is_system_role && !item.overrides_system && (
                <AnimatedButton
                    onClick={handleDelete}
                    disabled={isDeleting}
                    text={isDeleting ? "..." : ""}
                    icon={Trash2}
                    variant="destructive"
                    className="mr-2"
                />
            )}
        </div>
    )
}