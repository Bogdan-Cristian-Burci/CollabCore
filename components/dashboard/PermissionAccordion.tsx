import React from "react";
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
    handlePermissionChange: (permissionId: number, isActive: boolean) => void;
    gridCols?: string;
    disabled?: boolean;
}

const PermissionAccordion: React.FC<PermissionAccordionProps> = ({
    groupedPermissions,
    compareWith,
    isSaving = false,
    handlePermissionChange,
    gridCols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    disabled = false
}) => {
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

                                return (
                                    <div
                                        key={permission.id}
                                        className={`p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow ${
                                            hasChanged ? "border-blue-500 bg-blue-50" : ""
                                        }`}
                                    >
                                        <h5 className="font-medium text-md">{permission.display_name}</h5>
                                        <p className="text-sm text-muted-foreground">{permission.description}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-sm font-medium">
                                                {permState?.is_active ? "Enabled" : "Disabled"}
                                            </span>
                                            <SwitchButton
                                                className="cursor-pointer"
                                                checked={permState?.is_active || false}
                                                onChange={value => handlePermissionChange(permission.id, value)}
                                                disabled={disabled || isSaving}
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
    );
};

export default PermissionAccordion;