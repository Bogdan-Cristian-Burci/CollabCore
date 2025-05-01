"use client";

import {PlusIcon} from "lucide-react";
import {Tabs, TabsContent, TabsTrigger, AnimatedTabsList} from "@/components/dashboard/AnimatedTabs";
import OverridesTab from "./OverridesTab";
import { useState } from "react";
import {AnimatedButton} from "@/components/dashboard/AnimatedButton";
import RolesTab from "@/app/dashboard/settings/roles/RolesTab";
import PermissionsTab from "@/app/dashboard/settings/roles/PermissionsTab";

export default function RolesPermissionsPage(){

    const [activeTab, setActiveTab] = useState("roles");
    
    return (
        <div className="flex flex-col gap-4 w-full h-full">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Roles & Permissions Management</h2>
            </div>
            <div className="flex w-full h-full">
                <Tabs 
                    defaultValue="roles" 
                    className="w-full h-full" 
                    orientation="horizontal"
                    onValueChange={setActiveTab}
                    value={activeTab}
                >
                    <AnimatedTabsList className="flex -flex-start rounded-sm !p-1" activeTabValue={activeTab}>
                        <TabsTrigger 
                            value="roles" 
                            className="rounded-sm cursor-pointer z-10 bg-transparent text-[var(--foreground)] data-[state=active]:text-[var(--primary-foreground)] data-[state=active]:bg-transparent relative py-2 px-4"
                        >
                            Available Roles
                        </TabsTrigger>
                        <TabsTrigger 
                            value="permissions" 
                            className="rounded-sm cursor-pointer z-10 bg-transparent text-[var(--foreground)] data-[state=active]:text-[var(--primary-foreground)] data-[state=active]:bg-transparent relative py-2 px-4"
                        >
                            Own Permissions
                        </TabsTrigger>
                        <TabsTrigger 
                            value="overrides" 
                            className="rounded-sm cursor-pointer z-10 bg-transparent text-[var(--foreground)] data-[state=active]:text-[var(--primary-foreground)] data-[state=active]:bg-transparent relative py-2 px-4"
                        >
                            Users Roles and Permissions
                        </TabsTrigger>
                    </AnimatedTabsList>
                    <TabsContent value="roles">
                        <RolesTab/>
                    </TabsContent>
                    <TabsContent value="permissions">
                        <PermissionsTab/>
                    </TabsContent>
                    <TabsContent value="overrides">
                        <OverridesTab/>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}