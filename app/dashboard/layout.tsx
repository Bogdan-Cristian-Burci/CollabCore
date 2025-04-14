"use client";

import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import BreadCrumbComponent from "@/components/dashboard/BreadCrumbComponent";
import React, { useEffect } from "react";
import { useUserStore } from "@/app/store/userStore";
import { useOrganizationStore } from "@/app/store/organisationStore";
import { ToasterProvider } from "@/components/toaster-provider";

export default function DashBoardLayout({children}:{children:React.ReactNode}) {
  const { fetchUserProfile } = useUserStore();
  const { fetchUserOrganizations } = useOrganizationStore();
  
  useEffect(() => {
    // Load user profile and organizations when dashboard mounts
    const loadData = async () => {
      try {
        await fetchUserProfile();
        await fetchUserOrganizations();
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };
    
    loadData();
  }, [fetchUserProfile, fetchUserOrganizations]);

  return (
      <SidebarProvider>
          <ToasterProvider />
          <div className="flex h-screen w-full bg-white">
              <DashboardSidebar/>
              <main className="flex-1 overflow-y-auto p-4">
                  <div className="flex items-center justify-start  mb-4">
                    <SidebarTrigger/>
                    <BreadCrumbComponent/>
                  </div>
                {children}
              </main>
            </div>
      </SidebarProvider>
  );
}