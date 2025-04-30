"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Shield, Search, AlertCircle } from "lucide-react";
import UserPermissionAccordion from "@/components/dashboard/UserPermissionAccordion";
import { Permission } from "@/types/permission";
import { toast } from "sonner";
import { setUserPermissionOverride, deleteUserPermissionOverride } from "@/lib/api/users";
import { useUserPermissions } from "@/lib/hooks/useUserPermissions";
import { usePermissions } from "@/lib/hooks/usePermissions";


export default function PermissionsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);

  // Use the dedicated hook to fetch user with permissions
  const {
    data: user,
    isLoading,
    error,
    refetch
  } = useUserPermissions();

  // Also fetch all permissions from the API
  const {
    permissions,
    isLoading: isPermissionsLoading,
    error: permissionsError,
  } = usePermissions();


  // Process all permissions when they load
  useEffect(() => {
    if (permissions?.length > 0) {
      console.log("Setting all permissions:", permissions.length);
      setAllPermissions(permissions);
    }
  }, [permissions]);

  // Group permissions by category with filtering based on search term
  const groupedPermissions = useMemo(() => {
    if (!user) return {};

    console.log("User data received:", user.roles[0].permissions);

    // Extract permissions from user's role permissions
    let workingPermissions: Permission[] = [];
    
    // Use the user.roles[0].permissions if available
    if (user.roles && user.roles[0] && user.roles[0].permissions && user.roles[0].permissions.length > 0) {
      console.log("Using permissions from user role");
      workingPermissions = user.roles[0].permissions;
    }

    // If still no permissions but we have all permissions loaded, mark all as inactive
    if (workingPermissions.length === 0 && allPermissions.length > 0) {
      console.log("Using all permissions with inactive state");
      // Create a new array with all permissions but mark them as inactive
      workingPermissions = allPermissions.map(p => ({...p, is_active: false}));
    }

    // If we still have no permissions, return empty
    if (workingPermissions.length === 0) {
      console.log("No permissions available to display");
      return {};
    }

    console.log(`Total permissions to display: ${workingPermissions.length}`);

    // Apply search filter if needed
    const filteredPermissions = searchTerm.trim() === ""
      ? workingPermissions
      : workingPermissions.filter(permission =>
          permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          permission.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (permission.description && permission.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (permission.category && permission.category.toLowerCase().includes(searchTerm.toLowerCase()))
        );

    // Group permissions by category
    return filteredPermissions.reduce((acc: Record<string, Permission[]>, permission) => {
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
  }, [user, allPermissions, searchTerm]);

  const handlePermissionChange = async (permissionId: number, isActiveOrRevert: boolean | 'revert' | 'request') => {
    if (!user) return;
    
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
    
    // For permission request action
    if (isActiveOrRevert === 'request') {
      toast.success(`Access requested for "${foundPermission.display_name}" permission`);
      // In the future, this will send a notification to admin
      console.log(`User requested access for permission: ${foundPermission.name}`);
      return;
    }
    
    // The original implementation is kept for backward compatibility with other components
    // but is not used in the current user permissions tab
    setIsSaving(true);
    try {
      console.log("Updating permission:", foundPermission);
      
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
      } else if (typeof isActiveOrRevert === 'boolean') {
        // For both granting and denying, we use the same endpoint but with different type
        const isActive = isActiveOrRevert;
        console.log(`Setting permission override: ${foundPermission.name} to ${isActive ? 'grant' : 'deny'}`);
        
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

  // Only show loading if we're loading everything and don't have permissions yet
  if (isLoading && allPermissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error for permissions load failure, but only if we truly have no data
  if (error && allPermissions.length === 0 && !user) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white border rounded-lg shadow-md p-4">
        <AlertCircle className="text-red-500 mb-2" size={32} />
        <h1 className="text-2xl font-bold mb-4 text-red-500">Failed to load permissions</h1>
        <button 
          onClick={() => refetch()} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  // If we don't have a user but do have permissions, we can still show them
  if (!user && allPermissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white border rounded-lg shadow-md p-4">
        <h1 className="text-2xl font-bold mb-4">User data not available</h1>
        <p className="text-muted-foreground mb-4">Unable to load your user information.</p>
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
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">My Permissions</h2>
                <CardDescription>View your permissions in {user?.organisation?.name}</CardDescription>
              </div>
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search permissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-18rem)] px-10">
              {Object.keys(groupedPermissions).length > 0 ? (
                <UserPermissionAccordion 
                  groupedPermissions={groupedPermissions}
                  handlePermissionChange={handlePermissionChange}
                  disabled={false}
                  isSaving={isSaving}
                  gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                />
              ) : isLoading ? (
                <div className="flex flex-col items-center justify-center p-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
                  <p className="text-muted-foreground text-center">
                    Loading permissions...
                  </p>
                </div>
              ) : allPermissions.length > 0 ? (
                <div className="flex flex-col items-center justify-center p-10 border border-dashed rounded-lg">
                  <p className="text-muted-foreground text-center mb-2">
                    {searchTerm.trim() !== "" ? 
                      "No permissions found matching your search criteria." : 
                      "Permissions are being processed."
                    }
                  </p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-10 border border-dashed rounded-lg">
                  <p className="text-muted-foreground text-center">
                    No permissions available. Please try refreshing the page.
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}