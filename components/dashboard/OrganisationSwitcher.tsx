"use client";

import {SidebarMenu, SidebarMenuButton, SidebarMenuItem} from "@/components/ui/sidebar";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Building, Check, ChevronsUpDown} from "lucide-react";
import {OrganisationResource} from "@/types/user";
import React from "react";

export default function OrganisationSwitcher({organisations,defaultOrganisation}:{organisations: OrganisationResource[], defaultOrganisation: OrganisationResource}) {

    const [selectedOrganisation, setSelectedOrganisation] = React.useState<OrganisationResource>(defaultOrganisation);
    return (
    <SidebarMenu>
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                            <Building className="size-4"/>
                        </div>
                        <div className="flex flex-col gap-0.5 leading-none">
                            <span className="font-semibold">Organisation</span>
                            <span className="">{selectedOrganisation.name}</span>
                        </div>
                        <ChevronsUpDown className="ml-auto" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width]"
                    align="start"
                >
                    {
                        organisations.map((organisation)=>(
                            <DropdownMenuItem key={organisation.id} onSelect={()=>setSelectedOrganisation(organisation)}>
                                {organisation.name}{"  "}
                                { organisation.id === selectedOrganisation.id && <Check className="ml-auto"/> }
                            </DropdownMenuItem>
                        ))
                    }
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    </SidebarMenu>
  );
}