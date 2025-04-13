"use client";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Building, Check, ChevronsUpDown, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useState } from "react";
import { useOrganizations } from "@/lib/hooks/useOrganizations";
import { useOrganizationStore } from "@/app/store/organisationStore";
import { toast } from "sonner";

export default function OrganisationSwitcher() {
    const { organizations, isLoading, setActiveOrganization } = useOrganizations();
    const { currentOrganizationId } = useOrganizationStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);
    const { isMobile } = useSidebar()
    // Find current organization from the query data
    const currentOrganization = organizations.find(org => org.id === currentOrganizationId) || organizations[0] || null;
    
    // Determine if we should show dropdown UI elements
    const hasMultipleOrganizations = organizations.length > 1;

    const handleOrganizationSelect = async (orgId: string) => {
        // Don't do anything if user clicks the current organization
        if (Number(orgId) === currentOrganizationId) {
            setIsOpen(false);
            return;
        }
        
        try {
            setIsSwitching(true);
            await setActiveOrganization(orgId);
            toast.success("Organization switched successfully");
        } catch (error) {
            console.error("Error switching organization:", error);
            toast.error("Failed to switch organization");
        } finally {
            setIsSwitching(false);
            setIsOpen(false);
        }
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                {isLoading || isSwitching ? (
                    // Loading state - shown during initial load or when switching
                    <SidebarMenuButton size="lg">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                            <Building className="size-4"/>
                        </div>
                        <div className="flex flex-col gap-0.5 leading-none">
                            <span className="font-semibold">Organisation</span>
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </SidebarMenuButton>
                ) : hasMultipleOrganizations ? (
                    // Multiple organizations - show dropdown
                    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <Building className="size-4"/>
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">Organisation</span>
                                    <span className="">{currentOrganization?.name || "Select Organization"}</span>
                                </div>
                                <ChevronsUpDown className="ml-auto" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                            align="start"
                            side={isMobile ? "bottom" : "right"}
                            sideOffset={4}
                        >
                            {organizations.map((organisation) => (
                                <DropdownMenuItem
                                    key={organisation.id}
                                    onSelect={() => handleOrganizationSelect(String(organisation.id))}
                                    disabled={isSwitching}
                                >
                                    {organisation.name}{"  "}
                                    {organisation.id === currentOrganization?.id && <Check className="ml-auto"/>}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 p-2" disabled={isSwitching}>
                                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                    <Plus className="size-4" />
                                </div>
                                <div className="font-medium text-muted-foreground">Create organisation</div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    // Single organization - no dropdown needed
                    <SidebarMenuButton size="lg">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                            <Building className="size-4"/>
                        </div>
                        <div className="flex flex-col gap-0.5 leading-none">
                            <span className="font-semibold">Organisation</span>
                            <span className="">{currentOrganization?.name || "No organization"}</span>
                        </div>
                    </SidebarMenuButton>
                )}
            </SidebarMenuItem>
        </SidebarMenu>
    );
}