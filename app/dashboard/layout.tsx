import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import React from "react";


export default function DashBoardLayout({children}:{children:React.ReactNode}) {
  return (
      <SidebarProvider>
          <DashboardSidebar/>
          <main>
              <SidebarTrigger/>
                {children}
          </main>
      </SidebarProvider>
  );

}