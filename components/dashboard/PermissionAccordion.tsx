import React, { memo, useState, useEffect, useCallback } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import SwitchButton from "@/components/dashboard/SwitchButton";
import { Permission } from "@/types/permission";

export interface PermissionItem {
    id: number;
    permissions?: Permission[];
}

interface PermissionAccordionProps {
    groupedPermissions: Record<string, Permission[]>;
    compareWith?: PermissionItem;
    isSaving?: boolean;
    handlePermissionChange: (permissionId: number, isActive: boolean | 'revert') => void;
    gridCols?: string;
    disabled?: boolean;
}

// Memoized permission card component to reduce rerenders
const PermissionCard = memo(({
    permission,
    hasChanged,
    overrideStatus,
    handlePermissionChange,
    disabled,
    isSaving
}: {
    permission: Permission;
    hasChanged: boolean;
    overrideStatus?: string;
    handlePermissionChange: (permissionId: number, isActive: boolean | 'revert') => void;
    disabled?: boolean;
    isSaving?: boolean;
}) => {
    const cardStyle = getCardStyle(overrideStatus);
    const badge = getPermissionBadge(overrideStatus);

    // Handle toggle with stopping event propagation
    const handleToggle = (value: boolean) => {
        handlePermissionChange(permission.id, value);
    };

    const handleButtonClick = (e: React.MouseEvent) => {
        // Stop event propagation to prevent accordion from toggling
        e.stopPropagation();
    };

    return (
        <div
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
                    {permission.is_active ? "Enabled" : "Disabled"}
                </span>
                {overrideStatus === 'granted' || overrideStatus === 'denied' ? (
                    <button
                        onClick={(e) => {
                            handleButtonClick(e);
                            handlePermissionChange(permission.id, 'revert');
                        }}
                        disabled={disabled || isSaving}
                        className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded border border-border text-muted-foreground font-medium transition-colors cursor-pointer"
                    >
                        Revert to Default
                    </button>
                ) : (
                    <div onClick={handleButtonClick}>
                        <SwitchButton
                            className="cursor-pointer"
                            checked={permission.is_active || false}
                            onChange={handleToggle}
                            disabled={disabled || isSaving}
                        />
                    </div>
                )}
            </div>
        </div>
    );
});

PermissionCard.displayName = "PermissionCard";

// Helper function to get badge for permission override status
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

// Helper function to get card style based on override status
const getCardStyle = (overrideStatus?: string) => {
    if (!overrideStatus || overrideStatus === 'inherited') return "";
    
    return overrideStatus === 'granted' 
        ? "border-primary/20 bg-primary/5" 
        : "border-destructive/20 bg-destructive/5";
};

// Main accordion component - memoized to prevent unnecessary rerenders
const PermissionAccordion: React.FC<PermissionAccordionProps> = memo(({
    groupedPermissions,
    compareWith,
    isSaving = false,
    handlePermissionChange,
    gridCols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    disabled = false
}) => {
    // Store the currently open accordion sections
    const [openSections, setOpenSections] = useState<string[]>([]);
    
    // Initialize with ONLY the first category open for better UX
    useEffect(() => {
        const categories = Object.keys(groupedPermissions);
        if (categories.length > 0 && openSections.length === 0) {
            // Only open the first category by default
            setOpenSections([categories[0]]);
        }
    }, [groupedPermissions]);

    // Custom handler for accordion value change to maintain state
    const handleValueChange = useCallback((newValues: string[]) => {
        setOpenSections(newValues);
    }, []);

    return (
        <Accordion 
            type="multiple" 
            value={openSections}
            onValueChange={handleValueChange}
            className="w-full"
        >
            {Object.entries(groupedPermissions).map(([category, permissions]) => (
                <AccordionItem 
                    value={category} 
                    key={category}
                    className="border-b last:border-b-0"
                >
                    <AccordionTrigger 
                        className="cursor-pointer hover:no-underline py-4"
                        data-category={category} // Add data attribute for debugging
                    >
                        <div className="flex items-center justify-between w-full pr-4">
                            <span>{category}</span>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                {permissions.filter(p => p.is_active).length} of {permissions.length} enabled
                            </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div 
                            id={`permission-section-${category}`} 
                            className={`grid ${gridCols} gap-4 py-4`}
                        >
                            {permissions.map((permission) => {
                                // Only check for changes if compareWith is provided
                                const originalState = compareWith?.permissions?.find(p => p.id === permission.id);
                                const hasChanged = compareWith ? permission.is_active !== originalState?.is_active : false;
                                
                                // Get the visual styling based on override status
                                const overrideStatus = (permission as any).override_status;

                                return (
                                    <PermissionCard
                                        key={permission.id}
                                        permission={permission}
                                        hasChanged={hasChanged}
                                        overrideStatus={overrideStatus}
                                        handlePermissionChange={handlePermissionChange}
                                        disabled={disabled}
                                        isSaving={isSaving}
                                    />
                                );
                            })}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
});

PermissionAccordion.displayName = "PermissionAccordion";

export default PermissionAccordion;