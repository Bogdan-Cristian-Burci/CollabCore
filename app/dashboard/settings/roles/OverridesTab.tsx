"use client";

import { useUsers } from "@/lib/hooks/useUsers";
import {DataTable} from "@/app/dashboard/settings/roles/data-table";
import {columns} from "@/app/dashboard/settings/roles/columns";
import { Skeleton } from "@/components/ui/skeleton";

export default function OverridesTab() {
  
  // Use the custom hook to get users from the organization
  const { users, isLoading, error } = useUsers()

  
  return (
    <div className="flex flex-col h-full p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Permission Overrides</h1>
      </div>
      <div className="w-full">
          {
              isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Skeleton className="h-full w-full rounded-xl" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full bg-white border rounded-lg shadow-md p-4">
                        <h1 className="text-2xl font-bold mb-4 text-red-500">Failed to load users</h1>
                    </div>
                ) : (
                  <DataTable columns={columns} data={users}/>
              )
          }

      </div>
    </div>
  );
}