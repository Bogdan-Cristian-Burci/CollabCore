"use client";

import RoleCard from "@/components/dashboard/RoleCard";
import { useRoles } from "@/lib/hooks/useRoles";
import { Role } from "@/types/role";

export default function RolesTab() {
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white border rounded-lg shadow-md p-4">
        <h1 className="text-2xl font-bold mb-4 text-red-500">Failed to load roles</h1>
        <button 
          onClick={() => refetch()} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Organization Roles</h1>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          Add New Role
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role: Role) => (
          <RoleCard
            key={role.id}
            name={role.display_name || role.name}
            description={role.description}
            isSystemRole={role.is_system_role}
            usersCount={role.users_count}
            users={role.users || []}
            permissions={role.permissions.map(p => p.display_name || p.name)}
          />
        ))}
      </div>
      
      {roles.length === 0 && (
        <div className="flex flex-col items-center justify-center p-10 border border-dashed rounded-lg">
          <p className="text-muted-foreground text-center">
            No roles found. Add a new role to get started.
          </p>
        </div>
      )}
    </div>
  );
}