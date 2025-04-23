"use client";

import React  from "react";
import {Role} from "@/types/role";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";

export const RoleDetailedCard: React.FC<{ item: Role }> = ({ item }) => {
    return (
        <Card className="border-0 shadow-none">
            <CardHeader className="pb-2 flex justify-between">
                <CardTitle>{item.display_name}</CardTitle>
                <CardDescription>{item.is_system_role ? <Badge key="system">System</Badge> : <Badge key="custom">Custom</Badge>}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
                <p className="mb-4">{item.description}</p>
            </CardContent>
        </Card>
    );
};