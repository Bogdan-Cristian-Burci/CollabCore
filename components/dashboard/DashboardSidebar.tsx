"use client";

import {LucideIcon,LayoutGrid, Calendar, Mail, Bell, FolderDot, SquareCheckBig,Settings, Headset} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup, SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem
} from "@/components/ui/sidebar";
import Link from "next/link";
import {DropdownMenu} from "@/components/ui/dropdown-menu";
import OrganisationSwitcher from "@/components/dashboard/OrganisationSwitcher";
import { useSession } from "next-auth/react";


interface DashboardItem{
    title: string;
    icon:  LucideIcon;
    link: string;
}

interface DashboardCategory{
    category: string;
    name: string;
    items: DashboardItem[];
}

const menuItems : DashboardCategory[] = [
    {
      category:"dashboard",
      name:"Dashboard",
        items:[
            {
                title: "Home",
                icon: LayoutGrid,
                link: "/dashboard",
            },
            {
                title: "Calendar",
                icon: Calendar,
                link: "/dashboard/calendar",
            },
            {
                title: "Messages",
                icon: Mail,
                link: "/dashboard/messages",
            },
            {
                title: "Notifications",
                icon: Bell,
                link: "/dashboard/notifications",
            },
        ]
    },

    {
      category: "projects",
        name: "Project management",
        items: [
            {
                title: "My Projects",
                icon: FolderDot,
                link: "/dashboard/projects",
            },
            {
                title: "Tasks",
                icon: SquareCheckBig,
                link: "/dashboard/tasks",
            },
        ]
    },
    {
        category: "other",
        name: "Other",
        items: [
            {
                title: "Settings",
                icon: Settings,
                link: "/dashboard/settings",
            },
            {
                title: "Support",
                icon: Headset,
                link: "/dashboard/support",
            },
        ]
    }
];
export default function DashboardSidebar() {

    const {data,status } = useSession();

    console.log('auth data is ',data);
  return (
      <Sidebar collapsible="icon">
          <SidebarHeader>
            {/*<OrganisationSwitcher />*/}
          </SidebarHeader>
          <SidebarContent>
              {
                    menuItems.map((category) => (
                        <SidebarGroup key={category.category}>
                            <SidebarGroupLabel>{category.name}</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {category.items.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild>
                                                <Link href={item.link}>
                                                    <item.icon className="mr-2 h-4 w-4"/>
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    ))
              }
              <SidebarGroup/>
          </SidebarContent>
          <SidebarFooter/>
      </Sidebar>
  )
}