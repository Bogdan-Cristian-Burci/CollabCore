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
import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

// Define the interface for settings submenu items
interface SettingsItem {
    title: string;
    link: string;
}

// Settings menu items - easy to add new items here
const settingsItems: SettingsItem[] = [
    {
        title: "Roles",
        link: "/dashboard/settings/roles"
    },
    {
        title:"Board Templates",
        link: "/dashboard/settings/boards"
    },
    {
        title: "Tags",
        link: "/dashboard/settings/tags"
    },
    // Add new settings items here
    // Example:
    // {
    //     title: "Templates",
    //     link: "/dashboard/settings/templates"
    // }
];

export default function SettingsSidebar() {
    const [open, setOpen] = useState<boolean>(false);
    const menuItemsRef = useRef<HTMLUListElement>(null);

    // GSAP animation for when the menu opens/closes
    useGSAP(() => {
        if (!open) return;

        const tl = gsap.timeline();
        const menuItems = menuItemsRef.current?.querySelectorAll('.sidebar-menu-sub-item') || [];

        tl.fromTo(menuItems,
            {
                opacity: 0,
                y: 10,
                x: -10
            },
            {
                opacity: 1,
                y: 0,
                x: 0,
                duration: 0.3,
                stagger: 0.1,
                ease: "power2.out"
            }
        );

        return () => {
            tl.kill();
        };
    }, [open]);

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarMenu>
                <Collapsible
                    asChild
                    open={open}
                    onOpenChange={setOpen}
                    className="group/collapsible"
                >
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4"/>
                                <span className="ml-1">Settings</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub ref={menuItemsRef}>
                                {settingsItems.map((item) => (
                                    <SidebarMenuSubItem key={item.title} className="sidebar-menu-sub-item">
                                        <SidebarMenuSubButton asChild>
                                            <Link href={item.link}>
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            </SidebarMenu>
        </SidebarGroup>
    );
}