"use client";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu, SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub, SidebarMenuSubButton,
    SidebarMenuSubItem
} from "@/components/ui/sidebar";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {ChevronRight, Settings} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SettingsSidebar() {

    const [open, setOpen] = useState<boolean>(false);
  return (
    <SidebarGroup>
        <SidebarGroupLabel>Settings</SidebarGroupLabel>
        <SidebarMenu>
            <Collapsible asChild defaultOpen={open} onOpenChange={()=>setOpen(!open)} className="group/collapsible">
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4"/>
                            <span className="ml-1">Settings</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild>
                                    <Link href={"/dashboard/settings/roles"}>
                                        <span>Roles</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild>
                                    <Link href={"/dashboard/settings/tags"}>
                                        <span>Tags</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
            </Collapsible>
        </SidebarMenu>
    </SidebarGroup>
  );
}