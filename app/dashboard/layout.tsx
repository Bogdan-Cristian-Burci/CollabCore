"use client";

import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import React from "react";


export default function DashBoardLayout({children}:{children:React.ReactNode}) {
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