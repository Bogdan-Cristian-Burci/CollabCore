"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Search, UserCog } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function OverridesTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [userSelected, setUserSelected] = useState(false);
  
  // Demo users - in a real app, these would be fetched from an API
  const mockUsers = [
    { id: 1, name: "John Doe", email: "john.doe@example.com", role: "Administrator" },
    { id: 2, name: "Jane Smith", email: "jane.smith@example.com", role: "Manager" },
    { id: 3, name: "Michael Johnson", email: "michael.j@example.com", role: "Team Member" },
    { id: 4, name: "Emily Wilson", email: "emily.w@example.com", role: "Team Member" },
    { id: 5, name: "Alex Brown", email: "alex.b@example.com", role: "Manager" }
  ];
  
  // Filter users based on search term
  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="flex flex-col h-full p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Permission Overrides</h1>
      </div>
      
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="w-full lg:w-1/3">
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Search className="size-5" />
                <h3 className="text-lg font-semibold">Find User</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search-user">Search by name or email</Label>
                  <Input 
                    id="search-user" 
                    placeholder="Enter name or email" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Filter by role</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All roles</SelectItem>
                      <SelectItem value="administrator">Administrator</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="member">Team Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserCog className="size-5" />
                <h3 className="text-lg font-semibold">Users</h3>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-25rem)]">
                <div className="space-y-2">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <div 
                        key={user.id}
                        className="flex items-center gap-3 p-3 rounded-md hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => setUserSelected(true)}
                      >
                        <div className="flex-1">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.role}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <AlertTriangle className="text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No users found matching your criteria.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full lg:w-2/3">
          {!userSelected ? (
            <div className="flex flex-col items-center justify-center h-full p-10 border border-dashed rounded-lg">
              <UserCog size={48} className="text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Select a user to manage permission overrides</p>
              <p className="text-muted-foreground text-center mt-2">
                Permission overrides allow you to grant or deny specific permissions for individual users,
                overriding their role-based permissions.
              </p>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">Permission Overrides for John Doe</h3>
                <p className="text-muted-foreground">Current role: Administrator</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-muted p-3 rounded-md">
                    <div>
                      <Label className="text-base font-medium">Override Management</Label>
                      <p className="text-sm text-muted-foreground">
                        Add specific permissions or restrictions for this user
                      </p>
                    </div>
                    <Button size="sm">Add Override</Button>
                  </div>
                  
                  <ScrollArea className="h-[calc(100vh-20rem)]">
                    <div className="space-y-3">
                      <p className="text-muted-foreground text-sm">
                        This user currently has no permission overrides. Their access is determined by their role.
                      </p>
                      
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Example Override</h4>
                        <div className="bg-muted/50 p-3 rounded-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">Delete Projects</p>
                              <p className="text-sm text-muted-foreground">projects.delete</p>
                            </div>
                            <Select defaultValue="deny">
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="allow">Allow</SelectItem>
                                <SelectItem value="deny">Deny</SelectItem>
                                <SelectItem value="reset">Reset to Role</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}