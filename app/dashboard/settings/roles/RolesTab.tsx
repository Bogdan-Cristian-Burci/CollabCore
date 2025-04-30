"use client";

import {useRoles} from "@/lib/hooks/useRoles";
import { ExpandableWrapper } from "@/components/dashboard/ExpandableWrapper";
import React from "react";
import {RoleSimpleCard} from "@/components/dashboard/RoleSimpleCard";
import {RoleDetailedCard} from "@/components/dashboard/RoleDetailedCard";
import {Role} from "@/types/role";
import {RoleDetailedListCard} from "@/components/dashboard/RoleDetailedListCard";
import {PlusIcon} from "lucide-react";
import {AnimatedButton} from "@/components/dashboard/AnimatedButton";

export default function RolesTab(){

    const {
        roles,
        isLoading,
        error,
        refetch
    } = useRoles();



    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return(
        <div className="w-full h-full relative">
            <AnimatedButton icon={PlusIcon}  size="icon" className="flex justify-center absolute bottom-10 right-4 rounded-full"/>
            <ExpandableWrapper<Role>
                list={roles}
                searchBy="display_name"
                filterBy="is_system_role"
                SimpleComponent={RoleSimpleCard}
                DetailedComponent={RoleDetailedCard}
                ListDetailedComponent={RoleDetailedListCard}
            >
            </ExpandableWrapper>
        </div>

    )
}