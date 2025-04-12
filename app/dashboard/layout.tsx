"use client";

import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import React, { useEffect } from "react";
import { useUserStore } from "@/app/store/userStore";
import { useOrganizationStore } from "@/app/store/organisationStore";

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
          <div className="flex h-screen w-full">
          <DashboardSidebar/>
              <main className="flex-1 overflow-y-auto p-4">
                  <div className="flex items-center justify-between mb-4">
                    <SidebarTrigger/>
                  </div>
                {children}
                </main>
            </div>
      </SidebarProvider>
  );
}