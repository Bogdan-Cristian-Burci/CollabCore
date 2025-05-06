"use client";

import React, { memo, useCallback } from "react";
import SwitchButton from "@/components/dashboard/SwitchButton";
import { Permission } from "@/types/permission";

interface PermissionCardProps {
    permission: Permission;
    hasChanged: boolean;
    overrideStatus?: string;
    handlePermissionChange: (permissionId: number, isActive: boolean | 'revert') => void;
    disabled?: boolean;
    isSaving?: boolean;
}

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

// Memoized permission card component to reduce rerenders
const PermissionCard = memo(({
    permission,
    hasChanged,
    overrideStatus,
    handlePermissionChange,
    disabled,
    isSaving
}: PermissionCardProps) => {
    const cardStyle = getCardStyle(overrideStatus);
    const badge = getPermissionBadge(overrideStatus);

    // Handle toggle with stopping event propagation - memoized to prevent rerenders
    const handleToggle = useCallback((value: boolean) => {
        handlePermissionChange(permission.id, value);
    }, [handlePermissionChange, permission.id]);

    // Memoize the button click handler
    const handleButtonClick = useCallback((e: React.MouseEvent) => {
        // Stop event propagation to prevent accordion from toggling
        e.stopPropagation();
    }, []);

    // Memoize the revert handler
    const handleRevert = useCallback((e: React.MouseEvent) => {
        handleButtonClick(e);
        handlePermissionChange(permission.id, 'revert');
    }, [handleButtonClick, handlePermissionChange, permission.id]);

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
                        onClick={handleRevert}
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
}, (prevProps, nextProps) => {
    // Custom equality check to prevent unnecessary rerenders
    return (
        prevProps.permission.id === nextProps.permission.id &&
        prevProps.permission.is_active === nextProps.permission.is_active &&
        prevProps.hasChanged === nextProps.hasChanged &&
        prevProps.overrideStatus === nextProps.overrideStatus &&
        prevProps.disabled === nextProps.disabled &&
        prevProps.isSaving === nextProps.isSaving
    );
});

PermissionCard.displayName = "PermissionCard";

export default PermissionCard;