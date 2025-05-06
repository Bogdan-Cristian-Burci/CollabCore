import React, { memo, useEffect, useCallback, useState } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import PermissionCard from "@/components/dashboard/PermissionCard";
import { Permission } from "@/types/permission";
import { usePermissionSelectionStore } from "@/app/store/permissionSelectionStore";

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

// Main accordion component - memoized to prevent unnecessary rerenders
const PermissionAccordion: React.FC<PermissionAccordionProps> = memo(({
    groupedPermissions,
    compareWith,
    isSaving = false,
    handlePermissionChange,
    gridCols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    disabled = false
}) => {
    // Use the zustand store for initial open sections, but maintain local state after
    const { openAccordionSections: storeOpenSections, setOpenAccordionSections } = usePermissionSelectionStore();
    
    // Local state to maintain accordion open/closed state during rerenders
    const [localOpenSections, setLocalOpenSections] = useState<string[]>(storeOpenSections);
    
    // Initialize with ONLY the first category open for better UX
    useEffect(() => {
        const categories = Object.keys(groupedPermissions);
        if (categories.length > 0 && localOpenSections.length === 0) {
            // Only open the first category by default
            const initialOpenSections = [categories[0]];
            setLocalOpenSections(initialOpenSections);
            setOpenAccordionSections(initialOpenSections);
        }
    // Only run this effect when groupedPermissions or initial state changes, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupedPermissions, setOpenAccordionSections]);

    // Custom handler for accordion value change to maintain local state
    const handleValueChange = useCallback((newValues: string[]) => {
        setLocalOpenSections(newValues);
        setOpenAccordionSections(newValues);
    }, [setOpenAccordionSections]);

    // Memoize permission cards to prevent unnecessary rerenders
    const renderPermissionCards = useCallback((category: string, permissions: Permission[]) => {
        return (
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
        );
    }, [compareWith, disabled, gridCols, handlePermissionChange, isSaving]);

    return (
        <Accordion 
            type="multiple" 
            value={localOpenSections}
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
                        {renderPermissionCards(category, permissions)}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
});

PermissionAccordion.displayName = "PermissionAccordion";

export default PermissionAccordion;