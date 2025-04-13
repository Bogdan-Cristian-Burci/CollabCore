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

export default function SettingsSidebar() {
    const [open, setOpen] = useState<boolean>(false);
    
    // Refs for the elements we want to animate
    const rolesRef = useRef<HTMLAnchorElement>(null);
    const tagsRef = useRef<HTMLAnchorElement>(null);
    const menuItemsRef = useRef<HTMLUListElement>(null);
    
    // GSAP animation for when the menu opens/closes
    useGSAP(() => {
        // Only run animation if menu is open
        if (!open) return;
        
        // Create timeline for staggered animation
        const tl = gsap.timeline();
        
        // Get all menu item children
        const menuItems = menuItemsRef.current?.querySelectorAll('.sidebar-menu-sub-item') || [];
        
        // Animate each menu item
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
        
        // Clean up animation on unmount
        return () => {
            tl.kill();
        };
    }, [open]); // Re-run when open state changes
    
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
                                <SidebarMenuSubItem className="sidebar-menu-sub-item">
                                    <SidebarMenuSubButton asChild>
                                        <Link href={"/dashboard/settings/roles"} ref={rolesRef}>
                                            <span>Roles</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                <SidebarMenuSubItem className="sidebar-menu-sub-item">
                                    <SidebarMenuSubButton asChild>
                                        <Link href={"/dashboard/settings/tags"} ref={tagsRef}>
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