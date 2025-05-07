import React, { useMemo, useState, useEffect } from "react";
import PermissionAccordion from "./PermissionAccordion";
import { Permission } from "@/types/permission";
import { useUserPermissions } from "@/lib/hooks/useUsers";
import { setUserPermissionOverride, deleteUserPermissionOverride } from "@/lib/api/users";
import { toast } from "sonner";

interface UserPermissionsProps {
  userId: number;
}

const UserPermissions: React.FC<UserPermissionsProps> = ({ userId }) => {
  const [isSaving, setIsSaving] = useState(false);
  // Use React Query hook to fetch user with permissions
  const { data: user, isLoading, error, refetch } = useUserPermissions(userId);
  
  // Listen for refresh events
  useEffect(() => {
    const handleRefreshPermissions = (e: Event) => {
      const customEvent = e as CustomEvent;
      const eventUserId = customEvent.detail?.userId;
      
      if (eventUserId && eventUserId.toString() === userId.toString()) {
        console.log('Refreshing permissions for user:', userId);
        refetch();
      }
    };
    
    document.addEventListener('refreshUserPermissions', handleRefreshPermissions);
    
    return () => {
      document.removeEventListener('refreshUserPermissions', handleRefreshPermissions);
    };
  }, [userId, refetch]);
  
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
      
      // Check if this permission is in the user's permission_overrides
      const isGranted = user.permission_overrides?.grant?.includes(permission.name);
      const isDenied = user.permission_overrides?.deny?.includes(permission.name);
      
      // Set active state based on overrides
      const permissionWithOverride = {
        ...permission,
        is_active: isGranted ? true : (isDenied ? false : permission.is_active),
        override_status: isGranted ? "granted" : (isDenied ? "denied" : "inherited") as "granted" | "denied" | "inherited"
      };
      
      acc[category].push(permissionWithOverride);
      return acc;
    }, {});
  }, [user]);

  const handlePermissionChange = async (permissionId: number, isActiveOrRevert: boolean | 'revert') => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Find the permission by ID
      let foundPermission: Permission | undefined;
      for (const category in groupedPermissions) {
        foundPermission = groupedPermissions[category].find(p => p.id === permissionId);
        if (foundPermission) break;
      }
      
      if (!foundPermission) {
        toast.error("Permission not found");
        return;
      }
      
      // Handle revert action
      if (isActiveOrRevert === 'revert') {
        const success = await deleteUserPermissionOverride(user.id.toString(), foundPermission.id.toString());
        
        if (success) {
          toast.success(`Permission reverted to default successfully`);
          // Refresh the user data to get updated permissions
          refetch();
        } else {
          toast.error(`Failed to revert permission to default`);
        }
      } else {
        // For both granting and denying, we use the same endpoint but with different type
        const isActive = isActiveOrRevert as boolean;
        const success = await setUserPermissionOverride(user.id.toString(), {
          permission: foundPermission.name,
          type: isActive ? "grant" : "deny"
        });
        
        if (success) {
          toast.success(`Permission ${isActive ? 'granted' : 'denied'} successfully`);
          // Refresh the user data to get updated permissions
          refetch();
        } else {
          toast.error(`Failed to ${isActive ? 'grant' : 'deny'} permission`);
        }
      }
    } catch (error) {
      console.error("Error updating permission:", error);
      toast.error("Error updating permission");
    } finally {
      setIsSaving(false);
    }
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
        disabled={false} // Enable controls
        isSaving={isSaving}
        gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      />
    </div>
  );
};

export default UserPermissions;