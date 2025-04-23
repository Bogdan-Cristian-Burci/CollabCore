"use client";

import React from "react";
import {Role} from "@/types/role";
import {Accordion, AccordionItem, AccordionTrigger, AccordionContent} from "@/components/ui/accordion";
import {Switch} from "@/components/ui/switch";


export const RoleDetailedListCard : React.FC<{item:Role}> = ({item}) => {

    const groupedPermissions = item.permissions.reduce((acc, permission) => {
        const category = permission.category || "Uncategorized";
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(permission);
        return acc;
    }, {} as Record<string, typeof item.permissions>);

    console.log('Grouped Permissions:', groupedPermissions);

    return(
        <div className="h-full flex flex-col">
            <div className="mb-6">
                <h3 className="text-lg font-semibold">{item.display_name}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <Accordion type="single" collapsible className="w-full">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                    <AccordionItem value={category} key={category}>
                        <AccordionTrigger className="cursor-pointer">{category}</AccordionTrigger>
                        <AccordionContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {permissions.map((permission) => (
                                        <div key={permission.id} className="p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow">
                                            <h5 className="font-medium text-md">{permission.display_name}</h5>
                                            <p className="text-sm text-muted-foreground">{permission.description}</p>
                                            <Switch checked={permission.is_active} />
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}