"use client";

import React, { useState } from "react";
import RoleCard from "@/components/dashboard/RoleCard";
import ExpandedRoleCard from "@/components/dashboard/ExpandedRoleCard";
import { useRoles, useRolePermissions } from "@/lib/hooks/useRoles";
import { Role } from "@/types/role";

export default function RolesTab() {
  const { 
    roles, 
    isLoading, 
    error, 
    refetch 
  } = useRoles();
  
  const [expandedRoleId, setExpandedRoleId] = useState<number | null>(null);
  const expandedRole = roles.find(role => role.id === expandedRoleId);
  
  // Fetch permissions only when a role is expanded
  const { 
    permissions, 
    isLoading: isLoadingPermissions 
  } = useRolePermissions(
    expandedRoleId || 0, 
    { enabled: expandedRoleId !== null }
  );

  const handleViewPermissions = (roleId: number) => {
    setExpandedRoleId(roleId);
  };

  const handleClosePermissions = () => {
    setExpandedRoleId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Log error details for debugging
  if (error) {
    console.log('RolesTab - Error details:', error);
    
    // Check if it's a forbidden error (403)
    const isForbidden = (error.message.includes('403') || error.message.toLowerCase().includes('forbidden'));
    
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white border rounded-lg shadow-md p-4">
        <h1 className="text-2xl font-bold mb-4 text-red-500">
          {isForbidden ? "Access Denied" : "Failed to load roles"}
        </h1>
        <p className="text-gray-600 mb-4 text-center max-w-md">
          {isForbidden 
            ? "You don't have permission to view roles. Please contact your administrator for access."
            : "There was a problem loading the roles. This could be due to a network issue or server error."}
        </p>
        <p className="text-sm text-gray-500 mb-4 text-center">
          Error: {error.toString()}
        </p>
        {!isForbidden && (
          <button 
            onClick={() => refetch()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 space-y-6">
      <div className="relative grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gridTemplateRows: 'repeat(auto-fill, minmax(250px, 1fr))', minHeight: '300px' }}>
        {/* Regular role cards */}
        {roles.map((role: Role) => (
          <RoleCard
            key={role.id}
            id={role.id}
            name={role.display_name || role.name}
            description={role.description || ''}
            isSystemRole={role.is_system_role}
            users={role.users || []}
            onViewPermissions={() => handleViewPermissions(role.id)}
          />
        ))}
        
        {/* Expanded role card as an overlay that covers the entire grid */}
        {expandedRoleId !== null && expandedRole && (
          <div className="absolute inset-0 z-10" style={{ gridColumn: '1 / -1', gridRow: '1 / span 3' }}>
            <ExpandedRoleCard
              roleName={expandedRole.display_name || expandedRole.name}
              permissions={permissions}
              isLoading={isLoadingPermissions}
              onClose={handleClosePermissions}
            />
          </div>
        )}
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