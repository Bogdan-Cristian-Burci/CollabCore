"use client";

import React from "react";
import { useParams } from "next/navigation";
import { SingleProjectResource, ProjectFile } from "@/types/project";
import { UserResource } from "@/types/user";
import { cn } from "@/lib/utils";
import { FolderOpen, Plus, ArrowLeft, Calendar, Users, FileText, MoreHorizontal, X, Upload, Download, Trash2, Edit, Loader2, File, Image, Video, Music } from "lucide-react";
import { DropResult } from "@hello-pangea/dnd";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/loading";
import InlineEdit from "@/components/ui/inline-edit";
import BoardDisplay, { BoardColumn, BoardCard } from "@/components/ui/board-display";
import { useProject } from "@/lib/hooks/useProjects";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserMultiSelect } from "@/components/ui/user-multi-select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CheckIcon } from "lucide-react";
import { useUsers } from "@/lib/hooks/useUsers";
import { format } from "date-fns";

export default function ProjectPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = parseInt(params.id as string);
    
    const { project, isLoading, error, refetch } = useProject(projectId);
    const { users, isLoading: usersLoading } = useUsers();
    
    // Initialize with empty cards - tasks will be fetched later
    const [cards, setCards] = useState<BoardCard[]>([]);
    const [editErrors, setEditErrors] = useState<{ name?: string; description?: string; end_date?: string; status?: string }>({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [showUserSelect, setShowUserSelect] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [loadingUserId, setLoadingUserId] = useState<number | null>(null);
    const [thumbnailUrls, setThumbnailUrls] = useState<Record<number, string>>({});
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Load authenticated thumbnail images using proxy endpoint
    const loadThumbnail = useCallback(async (fileId: number, projectId: string) => {
        if (thumbnailUrls[fileId]) return; // Already loaded
        
        try {
            console.log('🔍 Attempting to load thumbnail for file', fileId);
            
            // Use our proxy endpoint that handles authentication
            const proxyThumbnailUrl = `/api/projects/${projectId}/documents/${fileId}/thumbnail`;
            
            const response = await fetch(proxyThumbnailUrl, {
                method: 'GET',
            });
            
            if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setThumbnailUrls(prev => ({ ...prev, [fileId]: url }));
                console.log('✅ Successfully loaded thumbnail for file', fileId);
            } else {
                console.warn('⚠️  Failed to load thumbnail:', response.status, response.statusText);
            }
            
        } catch (error) {
            console.error('❌ Failed to load thumbnail for file', fileId, ':', error);
        }
    }, [thumbnailUrls]);

    // Add fallback data for fields that might not exist in the API yet
    // Combine documents and attachments into a single files array for display
    const allFiles = [
        ...(project?.documents || []),
        ...(project?.attachments || []),
        ...(project?.files || []) // Legacy fallback
    ];
    
    const projectWithDefaults = project ? {
        ...project,
        status: project.status || 'draft',
        end_date: project.end_date || null,
        users: project.users || [],
        files: allFiles
    } : null;

    // Load thumbnails for all image files using the proxy endpoint
    useEffect(() => {
        if (!projectWithDefaults?.files) return;
        
        projectWithDefaults.files.forEach(file => {
            const isImage = file.mime_type?.startsWith('image/') || 
                           ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(
                               file.name.split('.').pop()?.toLowerCase() || ''
                           );
            
            if (isImage && file.conversions?.thumbnail && !thumbnailUrls[file.id]) {
                loadThumbnail(file.id, projectId.toString());
            }
        });
    }, [projectWithDefaults?.files, loadThumbnail, thumbnailUrls, projectId]);

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            Object.values(thumbnailUrls).forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [thumbnailUrls]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowUserSelect(false);
            }
        };

        if (showUserSelect) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUserSelect]);

    // Convert board columns to display columns
    // Since we have multiple boards, we'll show columns from the first board for now
    const firstBoard = project?.boards?.[0];
    const columns: BoardColumn[] = firstBoard?.board_type?.template?.columns_structure?.map(column => ({
        name: column.name,
        color: column.color || '#94a3b8',
        wip_limit: column.wip_limit
    })) || [];

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) {
            return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        setCards(prevCards => {
            const newCards = [...prevCards];
            const cardIndex = newCards.findIndex(card => card.id === draggableId);
            
            if (cardIndex !== -1) {
                newCards[cardIndex] = {
                    ...newCards[cardIndex],
                    columnId: destination.droppableId
                };
            }
            
            return newCards;
        });
    };

    const handleCreateTask = () => {
        // TODO: Implement task creation functionality
        console.log('Create task for project:', project?.name);
    };

    const handleGoBack = () => {
        router.push('/dashboard/projects');
    };

    const handleUpdateProject = async (field: 'name' | 'description' | 'end_date' | 'status', value: string | Date | null) => {
        if (!project) return;
        
        setIsUpdating(true);
        setEditErrors(prev => ({ ...prev, [field]: undefined }));
        
        try {
            let processedValue = value;
            if (field === 'end_date' && value instanceof Date) {
                processedValue = value.toISOString();
            }
            
            const response = await fetch(`/api/projects/${project.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    [field]: processedValue
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to update project ${field}`);
            }

            await refetch();
            toast.success(`Project ${field} updated successfully`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to update project ${field}`;
            setEditErrors(prev => ({ ...prev, [field]: errorMessage }));
            toast.error(errorMessage);
            if (field === 'name' || field === 'description') {
                throw error; // Re-throw to let InlineEdit component handle it
            }
        } finally {
            setIsUpdating(false);
        }
    };

    const handleToggleUser = async (user: UserResource) => {
        if (!project || loadingUserId === user.id) return;
        
        const isUserInProject = project.users?.some(projectUser => projectUser.id === user.id);
        
        setLoadingUserId(user.id);
        try {
            if (isUserInProject) {
                // Remove user from project
                const response = await fetch(`/api/projects/${project.id}/users/${user.id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to remove user from project');
                }

                await refetch();
                toast.success(`${user.name || user.email} removed from project successfully`);
            } else {
                // Add user to project
                const response = await fetch(`/api/projects/${project.id}/users`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userIds: [user.id]
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to add user to project');
                }

                await refetch();
                toast.success(`${user.name || user.email} added to project successfully`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to ${isUserInProject ? 'remove' : 'add'} user`;
            toast.error(errorMessage);
        } finally {
            setLoadingUserId(null);
        }
    };

    const handleRemoveUser = async (userId: number) => {
        if (!project) return;
        
        try {
            const response = await fetch(`/api/projects/${project.id}/users/${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to remove user from project');
            }

            await refetch();
            toast.success('User removed from project successfully');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to remove user from project';
            toast.error(errorMessage);
        }
    };

    const handleFileUpload = async (file: File) => {
        if (!project) return;
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await fetch(`/api/projects/${project.id}/documents`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upload document');
            }

            await refetch();
            toast.success('Document uploaded successfully');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload document';
            toast.error(errorMessage);
        }
    };

    const handleFileDelete = async (fileId: number) => {
        if (!project) return;
        
        try {
            const response = await fetch(`/api/projects/${project.id}/documents/${fileId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete document');
            }

            await refetch();
            toast.success('Document deleted successfully');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete document';
            toast.error(errorMessage);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'on_hold': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatFileSize = (file: any) => {
        const bytes = file.size || file.file_size || 0;
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (mimeType: string | undefined, fileName: string) => {
        if (!mimeType) {
            // Fallback to file extension
            const extension = fileName.split('.').pop()?.toLowerCase();
            switch (extension) {
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'gif':
                case 'webp':
                case 'svg':
                    return Image;
                case 'mp4':
                case 'webm':
                case 'avi':
                case 'mov':
                    return Video;
                case 'mp3':
                case 'wav':
                case 'ogg':
                    return Music;
                default:
                    return FileText;
            }
        }

        if (mimeType.startsWith('image/')) {
            return Image;
        } else if (mimeType.startsWith('video/')) {
            return Video;
        } else if (mimeType.startsWith('audio/')) {
            return Music;
        } else {
            return FileText;
        }
    };

    if (isLoading) {
        return <Loading message="Loading project..." />;
    }

    if (error) {
        return (
            <div className="h-full flex flex-col items-center justify-center">
                <p className="text-destructive">Failed to load project</p>
                <p className="text-muted-foreground text-sm mt-1">
                    {error instanceof Error ? error.message : 'Unknown error occurred'}
                </p>
                <Button 
                    variant="outline" 
                    onClick={handleGoBack} 
                    className="mt-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Projects
                </Button>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="h-full flex flex-col items-center justify-center">
                <p className="text-muted-foreground">Project not found</p>
                <Button 
                    variant="outline" 
                    onClick={handleGoBack} 
                    className="mt-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Projects
                </Button>
            </div>
        );
    }


    // Show ALL users (both project members and non-members) with search filtering
    const filteredUsers = (users || []).filter(user => {
        if (!searchValue.trim()) return true;
        const searchTerm = searchValue.toLowerCase();
        return (
            (user.name && user.name.toLowerCase().includes(searchTerm)) ||
            user.email.toLowerCase().includes(searchTerm)
        );
    });

    // Helper function to check if user is in project
    const isUserInProject = (userId: number) => {
        return projectWithDefaults.users?.some(projectUser => projectUser.id === userId) || false;
    };

    const additionalActions = (
        <div className="flex items-center justify-between w-full">
            <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="mr-2"
            >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={handleCreateTask}
                className="ml-auto"
            >
                <Plus className="h-4 w-4 mr-1" />
                Create Task
            </Button>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            {/* Project Header */}
            <div className="bg-background border-b border-border p-4">
                <div className="flex items-start justify-between mb-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGoBack}
                        className="flex-shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                    </Button>
                    <div className="flex flex-col items-start gap-3 flex-1 w-full">
                        <div className="flex-1 flex min-w-0 w-full">
                            <FolderOpen className="h-6 w-6 text-muted-foreground flex-shrink-0 mr-1" />
                            <div className="flex flex-1 justify-between gap-2 mb-1">
                                <InlineEdit
                                    value={project.name}
                                    onSave={(value) => handleUpdateProject('name', value)}
                                    placeholder="Project name..."
                                    required
                                    maxLength={100}
                                    displayClassName="text-xl font-semibold"
                                    isLoading={isUpdating}
                                    error={editErrors.name}
                                />
                                <Badge variant="secondary" className="text-xs">
                                    {project.key}
                                </Badge>
                            </div>
                        </div>
                        <InlineEdit
                            value={project.description || ''}
                            onSave={(value) => handleUpdateProject('description', value)}
                            placeholder="Add a description..."
                            multiline
                            maxLength={500}
                            displayClassName="text-muted-foreground text-sm"
                            isLoading={isUpdating}
                            error={editErrors.description}
                        />
                    </div>
                </div>
                
                {/* Project Metadata Row */}
                <div className="flex items-center gap-6 text-sm">
                    {/* Status */}
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Status:</span>
                        <Select 
                            value={projectWithDefaults.status} 
                            onValueChange={(value) => handleUpdateProject('status', value)}
                        >
                            <SelectTrigger className="w-32 h-7">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="on_hold">On Hold</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {/* Due Date */}
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Due:</span>
                        <DatePicker
                            value={projectWithDefaults.end_date ? new Date(projectWithDefaults.end_date) : undefined}
                            onChange={(date) => handleUpdateProject('end_date', date)}
                            placeholder="Set due date"
                            className="w-auto h-7 text-sm"
                        />
                    </div>
                    
                    {/* Task Count */}
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Tasks:</span>
                        <span className="font-medium">{project.tasks_count}</span>
                    </div>
                    
                    {/* Users */}
                    <div className="flex items-center gap-2 relative">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Team:</span>
                        <div className="flex items-center gap-1">
                            {projectWithDefaults.users?.slice(0, 3).map((user) => (
                                <Avatar key={user.id} className="h-6 w-6 border border-white -ml-2.5">
                                    <AvatarImage src={user.avatar_url} />
                                    <AvatarFallback className="text-xs">
                                        {user.name?.charAt(0) || user.email?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                            {projectWithDefaults.users && projectWithDefaults.users.length > 3 && (
                                <span className="text-xs text-muted-foreground ml-1">
                                    +{projectWithDefaults.users.length - 3} more
                                </span>
                            )}
                            <div className="relative">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 ml-1"
                                    onClick={() => setShowUserSelect(!showUserSelect)}
                                >
                                    <Plus className="h-3 w-3 cursor-pointer" />
                                </Button>
                                
                                {/* Dropdown positioned directly under the plus button */}
                                {showUserSelect && (
                                    <div ref={dropdownRef} className="absolute top-full left-0 z-50 mt-2 w-80">
                                        {usersLoading ? (
                                            <div className="bg-background border border-border rounded-lg shadow-lg p-4">
                                                <div className="text-center py-4 text-sm text-muted-foreground">
                                                    Loading users...
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-background border border-border rounded-lg shadow-lg">
                                                <Command>
                                                    <CommandInput 
                                                        placeholder="Search users..." 
                                                        value={searchValue}
                                                        onValueChange={setSearchValue}
                                                        className="border-none"
                                                    />
                                                    <CommandList>
                                                        <CommandEmpty>No users found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {filteredUsers.map((user) => {
                                                                const isSelected = isUserInProject(user.id);
                                                                const isLoading = loadingUserId === user.id;
                                                                return (
                                                                    <CommandItem
                                                                        key={user.id}
                                                                        onSelect={() => handleToggleUser(user)}
                                                                        className={cn(
                                                                            "cursor-pointer flex items-center gap-3",
                                                                            isLoading && "opacity-60 cursor-not-allowed"
                                                                        )}
                                                                        disabled={isLoading}
                                                                    >
                                                                        {/* Checkbox or Loading Spinner */}
                                                                        {isLoading ? (
                                                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                                        ) : (
                                                                            <div
                                                                                className={cn(
                                                                                    "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                                                    isSelected
                                                                                        ? "bg-primary text-primary-foreground"
                                                                                        : "opacity-50 [&_svg]:invisible"
                                                                                )}
                                                                            >
                                                                                <CheckIcon className="h-4 w-4" />
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {/* Avatar */}
                                                                        <Avatar className={cn("h-6 w-6", isLoading && "opacity-60")}>
                                                                            <AvatarImage src={user.avatar_url} />
                                                                            <AvatarFallback className="text-xs">
                                                                                {user.name?.charAt(0) || user.email?.charAt(0)}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        
                                                                        {/* User Info */}
                                                                        <div className={cn("flex flex-col flex-1", isLoading && "opacity-60")}>
                                                                            <span className="text-sm font-medium">
                                                                                {user.name || user.email}
                                                                            </span>
                                                                            {user.name && (
                                                                                <span className="text-xs text-muted-foreground">
                                                                                    {user.email}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        
                                                                        {/* Loading indicator text */}
                                                                        {isLoading && (
                                                                            <span className="text-xs text-muted-foreground">
                                                                                {isSelected ? 'Removing...' : 'Adding...'}
                                                                            </span>
                                                                        )}
                                                                    </CommandItem>
                                                                );
                                                            })}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Tabbed Content */}
            <div className="flex-1 flex flex-col">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <div className="border-b border-border px-4">
                        <TabsList className="bg-transparent p-0 h-auto">
                            <TabsTrigger value="overview" className="px-4 py-2">
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="files" className="px-4 py-2">
                                <FileText className="h-4 w-4 mr-1" />
                                Documents ({projectWithDefaults.files?.length || 0})
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    
                    <TabsContent value="overview" className="flex-1 p-4">
                        <BoardDisplay
                            columns={columns}
                            cards={cards}
                            onDragEnd={onDragEnd}
                            additionalActions={(
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCreateTask}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Create Task
                                </Button>
                            )}
                            emptyStateText="No boards configured for this project."
                            showTestHint={false}
                        />
                    </TabsContent>
                    
                    <TabsContent value="files" className="flex-1 p-4">
                        <div className="h-full flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">Project Documents</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                handleFileUpload(file);
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                    >
                                        <Upload className="h-4 w-4 mr-1" />
                                        Upload File
                                    </Button>
                                </div>
                            </div>
                            
                            {projectWithDefaults.files && projectWithDefaults.files.length > 0 ? (
                                <div className="grid gap-3">
                                    {projectWithDefaults.files.map((file) => {
                                        const FileIcon = getFileIcon(file.mime_type, file.name);
                                        const isImage = file.mime_type?.startsWith('image/') || 
                                                       ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(
                                                           file.name.split('.').pop()?.toLowerCase() || ''
                                                       );
                                        
                                        // Use the correct field names from backend response
                                        const fileUrl = file.url || file.file_path;
                                        const thumbnailUrl = file.conversions?.thumbnail || fileUrl;
                                        
                                        return (
                                            <div key={file.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    {/* Thumbnail or Icon */}
                                                    <div className="flex-shrink-0">
                                                        {isImage && (thumbnailUrls[file.id] || fileUrl) ? (
                                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border">
                                                                <img
                                                                    src={thumbnailUrls[file.id] || thumbnailUrl || fileUrl}
                                                                    alt={file.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        // Fallback to icon if image fails to load
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.style.display = 'none';
                                                                        target.nextElementSibling?.classList.remove('hidden');
                                                                    }}
                                                                />
                                                                <FileIcon className="h-6 w-6 text-gray-400 absolute inset-0 m-auto hidden" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-lg bg-gray-100 border flex items-center justify-center">
                                                                <FileIcon className="h-6 w-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* File Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">{file.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatFileSize(file)} • Uploaded by {file.uploaded_by?.name || 'Unknown'} • {format(new Date(file.created_at), 'MMM d, yyyy')}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {/* Actions */}
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => window.open(fileUrl, '_blank')}
                                                        disabled={!fileUrl}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                        onClick={() => handleFileDelete(file.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-center">
                                    <div>
                                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                                        <p className="text-gray-500 mb-4">Upload documents to share with your team</p>
                                        <Button
                                            variant="outline"
                                            onClick={() => document.getElementById('file-upload')?.click()}
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Upload your first document
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}