import React, { useMemo } from "react";
import PermissionAccordion from "./PermissionAccordion";
import { Permission } from "@/types/permission";
import { useUserPermissions } from "@/lib/hooks/useUsers";

interface UserPermissionsProps {
  userId: number;
}

const UserPermissions: React.FC<UserPermissionsProps> = ({ userId }) => {
  // Use React Query hook to fetch user with permissions
  const { data: user, isLoading, error } = useUserPermissions(userId);
  
  // Group permissions by category with memoization to avoid unnecessary recalculations
  const groupedPermissions = useMemo(() => {
    if (!user || !user.roles) return {};
    
    // Extract permissions from user roles
    const permissions: Permission[] = [];
    
    // Process roles and their permissions
    if (Array.isArray(user.roles)) {
      user.roles.forEach(role => {
        if (typeof role === 'object' && role !== null && role.permissions && Array.isArray(role.permissions)) {
          permissions.push(...role.permissions);
        }
      });
    }
    
    // Group permissions by category
    return permissions.reduce((acc: Record<string, Permission[]>, permission) => {
      const category = permission.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    }, {});
  }, [user]);

  const handlePermissionChange = (permissionId: number, isActive: boolean) => {
    // This is a read-only view, so we're not implementing changes
    console.log(`Permission ${permissionId} changed to ${isActive}`);
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading permissions...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Failed to load user permissions</div>;
  }

  if (!user) {
    return <div className="p-4 text-center">User data not available.</div>;
  }

  if (Object.keys(groupedPermissions).length === 0) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-medium mb-4">User Permissions</h3>
        <div className="p-4 border rounded-md bg-gray-50">
          <p className="text-center text-gray-500">
            No permissions found for this user.
          </p>
          <p className="text-center text-sm text-gray-400 mt-2">
            User ID: {userId} | Name: {user.name}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-4">User Permissions</h3>
      <PermissionAccordion 
        groupedPermissions={groupedPermissions}
        handlePermissionChange={handlePermissionChange}
        disabled={true} // Read-only view
        gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      />
    </div>
  );
};

export default UserPermissions;