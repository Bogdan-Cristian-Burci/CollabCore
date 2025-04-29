"use client";

import {ColumnDef, Row} from "@tanstack/react-table";
import {UserResource} from "@/types/user";

export const columns: ColumnDef<UserResource>[] = [
    {
        accessorKey:"name",
        header:"Name",
    },
    {
        accessorKey:"email",
        header:"Email",
    },
    {
        accessorKey:"roles",
        header:"Role",
        cell:({row} : {row: Row<UserResource>}) => {
            const roles = row.getValue("roles");
            
            // Handle the case when roles is an object instead of an array
            if (!Array.isArray(roles)) {
                return (
                    <div className="flex flex-wrap gap-2">
                        <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded">
                            {typeof roles === 'object' ? 'Complex Role' : (roles || 'No Role')}
                        </span>
                    </div>
                );
            }
            
            return (
                <div className="flex flex-wrap gap-2">
                    {roles.map((role, index) => (
                        <span key={index} className="bg-gray-200 text-gray-800 px-2 py-1 rounded">
                            {typeof role === 'object' ? role.name || 'Role' : role}
                        </span>
                    ))}
                </div>
            );
        },
    },
];
