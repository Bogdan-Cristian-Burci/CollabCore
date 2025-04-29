import {Role} from "@/types/role";
import React, {useEffect} from "react";
import {Badge} from "@/components/ui/badge";

export const RoleSimpleCard : React.FC<{item:Role}> = ({item}) => {

    useEffect(() => {
        console.log('from item',item)
    }, [item]);
    return(
        <div className="flex justify-between">
            <h3>{item.display_name}</h3>
            <Badge>{item.is_system_role ? "System" : "Custom"}</Badge>
        </div>
    )
}