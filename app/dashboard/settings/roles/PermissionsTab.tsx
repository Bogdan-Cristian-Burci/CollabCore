"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckSquare, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { Permission } from "@/types/permission";

export default function PermissionsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const { permissions, isLoading, error, refetch } = usePermissions();

  // Extract unique categories for filtering
  const categories = [...new Set(permissions.map(p => p.category))].sort();

  // Filter permissions based on search and category filter
  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = searchTerm === "" || 
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = !filter || permission.category === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Group permissions by category
  const permissionsByCategory = filteredPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

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

  return (
    <div className="flex flex-col h-full p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Permissions Catalog</h1>
      </div>
      
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="w-full lg:w-1/3">
          <Input
            placeholder="Search permissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Categories</h3>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => setFilter(null)}
                    className={`flex items-center gap-2 p-2 rounded-md transition-colors ${!filter ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  >
                    <Shield size={16} />
                    <span>All Permissions</span>
                    <Badge className="ml-auto">{permissions.length}</Badge>
                  </button>
                  
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setFilter(category)}
                      className={`flex items-center gap-2 p-2 rounded-md transition-colors ${filter === category ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    >
                      <Shield size={16} />
                      <span>{category}</span>
                      <Badge className="ml-auto">
                        {permissions.filter(p => p.category === category).length}
                      </Badge>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full lg:w-2/3">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {Object.entries(permissionsByCategory).length > 0 ? (
              Object.entries(permissionsByCategory).map(([category, perms]) => (
                <div key={category} className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">{category}</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {perms.map((permission) => (
                      <Card key={permission.id} className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-lg">{permission.display_name}</h3>
                              <p className="text-muted-foreground text-sm mb-2">{permission.name}</p>
                              <p>{permission.description}</p>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {permission.category}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-10 border border-dashed rounded-lg">
                <p className="text-muted-foreground text-center">
                  No permissions found matching your criteria.
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}