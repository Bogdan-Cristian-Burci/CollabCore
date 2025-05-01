import React from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import SwitchButton from "@/components/dashboard/SwitchButton";
import { Permission } from "@/types/permission";

export interface PermissionItem {
    id: number;
    permissions?: Permission[];
}

interface UserPermissionAccordionProps {
    groupedPermissions: Record<string, Permission[]>;
    compareWith?: PermissionItem;
    isSaving?: boolean;
    handlePermissionChange: (permissionId: number, isActive: boolean | 'revert' | 'request') => void;
    gridCols?: string;
    disabled?: boolean;
}

const UserPermissionAccordion: React.FC<UserPermissionAccordionProps> = ({
    groupedPermissions,
    compareWith,
    isSaving = false,
    handlePermissionChange,
    gridCols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    disabled = false
}) => {
    const getPermissionBadge = (overrideStatus?: string) => {
        if (!overrideStatus || overrideStatus === 'inherited') return null;
        
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                overrideStatus === 'granted' 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'bg-destructive/10 text-destructive border border-destructive/20'
            }`}>
                {overrideStatus === 'granted' ? 'Explicitly Granted' : 'Explicitly Denied'}
            </span>
        );
    };

    const getCardStyle = (overrideStatus?: string) => {
        if (!overrideStatus || overrideStatus === 'inherited') return "";
        
        return overrideStatus === 'granted' 
            ? "border-primary/20 bg-primary/5" 
            : "border-destructive/20 bg-destructive/5";
    };

    return (
        <Accordion type="single" collapsible className="w-full">
            {Object.entries(groupedPermissions).map(([category, permissions]) => (
                <AccordionItem value={category} key={category}>
                    <AccordionTrigger className="cursor-pointer">{category}</AccordionTrigger>
                    <AccordionContent>
                        <div className={`grid ${gridCols} gap-4`}>
                            {permissions.map((permission) => {
                                const permState = permissions.find(p => p.id === permission.id);
                                
                                // Only check for changes if compareWith is provided
                                const originalState = compareWith?.permissions?.find(p => p.id === permission.id);
                                const hasChanged = compareWith ? permState?.is_active !== originalState?.is_active : false;
                                
                                // Get the visual styling based on override status
                                const overrideStatus = (permission as any).override_status;
                                const cardStyle = getCardStyle(overrideStatus);
                                const badge = getPermissionBadge(overrideStatus);

                                return (
                                    <div
                                        key={permission.id}
                                        className={`p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow ${
                                            hasChanged ? "border-secondary/50 bg-secondary/10" : cardStyle
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <h5 className="font-medium text-md">{permission.display_name}</h5>
                                            {badge}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">{permission.description}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-sm font-medium">
                                                {permState?.is_active ? "Enabled" : "Disabled"}
                                            </span>
                                            {permState?.is_active ? (
                                                <SwitchButton
                                                    className="cursor-not-allowed"
                                                    checked={true}
                                                    onChange={() => {}} // No action when clicked
                                                    disabled={true} // Always disabled for active permissions
                                                />
                                            ) : (
                                                <button
                                                    onClick={() => handlePermissionChange(permission.id, 'request')}
                                                    disabled={disabled || isSaving}
                                                    className="text-xs px-2 py-1 bg-accent hover:bg-accent/80 rounded border border-border text-accent-foreground font-medium transition-colors"
                                                >
                                                    Request Access
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
};

export default UserPermissionAccordion;