"use client";
import {Button} from "@/components/ui/button";
import {PlusIcon, ShieldAlertIcon} from "lucide-react";
import {Tabs, TabsContent, TabsTrigger, AnimatedTabsList} from "@/components/dashboard/AnimatedTabs";
import RolesTab from "@/app/dashboard/settings/roles/RolesTab";
import PermissionsTab from "@/app/dashboard/settings/roles/PermissionsTab";
import OverridesTab from "./OverridesTab";
import { useState, useEffect } from "react";
import AnimatedButton from "@/components/dashboard/AnimatedButton";
import { useUserStore } from "@/app/store/userStore";
import { api } from "@/lib/fetch-interceptor";

export default function RolesPermissionsPage(){
    const [activeTab, setActiveTab] = useState("roles");
    const { user, hasPermission } = useUserStore();
    const [canManageRoles, setCanManageRoles] = useState<boolean | null>(null);
    
    
    // Skip client-side permission checks - rely on API-level permissions
    useEffect(() => {
        // Always allow access on client side - server API enforces permissions
        setCanManageRoles(true);
    }, []);
    
    // Show loading until permission check is complete
    if (canManageRoles === null) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }
    
    // Show access denied if user doesn't have permission
    if (canManageRoles === false) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-white border rounded-lg shadow-md p-8">
                <ShieldAlertIcon className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                <p className="text-gray-600 text-center max-w-md mb-6">
                    You don't have permission to access the Roles & Permissions Management page.
                    Please contact your administrator if you need access.
                </p>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col gap-4 w-full h-full">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Roles & Permissions Management</h2>
                <AnimatedButton icon={PlusIcon} text="Add Role" variant="outline" size="sm" className="hidden lg:inline"/>
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
                            className="rounded-sm cursor-pointer z-10 bg-transparent text-black data-[state=active]:text-white data-[state=active]:bg-transparent relative py-2 px-4"
                        >
                            Roles
                        </TabsTrigger>
                        <TabsTrigger 
                            value="permissions" 
                            className="rounded-sm cursor-pointer z-10 bg-transparent text-black data-[state=active]:text-white data-[state=active]:bg-transparent relative py-2 px-4"
                        >
                            Permissions Catalog
                        </TabsTrigger>
                        <TabsTrigger 
                            value="overrides" 
                            className="rounded-sm cursor-pointer z-10 bg-transparent text-black data-[state=active]:text-white data-[state=active]:bg-transparent relative py-2 px-4"
                        >
                            User Permission Overrides
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