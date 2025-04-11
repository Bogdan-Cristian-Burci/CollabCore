"use client";

import {SidebarMenu, SidebarMenuButton, SidebarMenuItem} from "@/components/ui/sidebar";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Building, Check, ChevronsUpDown} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton";

import React, {useEffect, useState} from "react";
import {useOrganizationStore} from "@/app/store/organisationStore";

export default function OrganisationSwitcher() {

    const {
    organizations,
    currentOrganization,
    fetchUserOrganizations,
    setCurrentOrganization,
    isLoading
    }= useOrganizationStore()

    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        fetchUserOrganizations();
    }, [fetchUserOrganizations]);

    const handleOrganizationSelect = async (orgId: string) => {
        await setCurrentOrganization(orgId);
        setIsOpen(false);
    };
    return (
    <SidebarMenu>
        <SidebarMenuItem>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                            <Building className="size-4"/>
                        </div>
                        <div className="flex flex-col gap-0.5 leading-none">
                            <span className="font-semibold">Organisation</span>
                            {isLoading ? (
                                <Skeleton className="h-4 w-20" />
                            ) : (
                                <span className="">{currentOrganization?.name || "?"}</span>
                            )}
                        </div>
                        <ChevronsUpDown className="ml-auto" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width]"
                    align="start"
                >
                    {isLoading ? (
                        <div className="p-2">
                            <Skeleton className="h-6 w-full mb-2" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                    ) : (
                        organizations.map((organisation)=>(
                            <DropdownMenuItem key={organisation.id} onSelect={()=>handleOrganizationSelect(String(organisation.id))}>
                                {organisation.name}{"  "}
                                { organisation.id === currentOrganization?.id && <Check className="ml-auto"/> }
                            </DropdownMenuItem>
                        ))
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    </SidebarMenu>
  );
}