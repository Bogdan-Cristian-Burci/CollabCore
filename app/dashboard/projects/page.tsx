"use client";
import React, { useState } from "react";
import {Project} from "@/types/project";
import ProjectSummaryCard from "@/components/dashboard/projects/ProjectSummaryCard";
import ProjectListItem from "@/components/dashboard/projects/ProjectListItem";
import { DeleteProjectDialog } from "@/components/dashboard/projects/DeleteProjectDialog";
import { useProjects } from "@/lib/hooks/useProjects";
import { deleteProject } from "@/lib/api/projects";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/loading";
import { Search, Columns, List } from "lucide-react";
import AddNewProject from "@/components/dashboard/projects/AddNewProject";
import { toast } from "sonner";

export default function ProjectsPage(){
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [deleteProject_, setDeleteProject] = useState<Project | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    
    const { 
      projects, 
      pagination, 
      setPage, 
      setPerPage, 
      searchTerm,
      setSearchTerm,
      isLoading,
      isFetching,
      error,
      refetch 
    } = useProjects();

    // Handle delete project
    const handleDeleteProject = (project: Project) => {
        setDeleteProject(project);
        setDeleteDialogOpen(true);
    };

    // Handle delete project API call
    const handleConfirmDelete = async () => {
        if (!deleteProject_) return;
        
        try {
            await deleteProject(deleteProject_.id);
            toast.success("Project deleted successfully!");
            refetch(); // Refresh the projects list
        } catch (error) {
            console.error("Failed to delete project:", error);
            toast.error("Failed to delete project. Please try again.");
            throw error; // Let the dialog handle the error state
        }
    };
    
    return (
        <div className="flex flex-col gap-4 w-full h-full">
            {isLoading ? (
                <Loading message="Loading projects..." className="h-32" />
            ) : error ? (
                <div className="flex items-center justify-center h-32 text-red-500">
                    <p>Error loading projects: {error.message}</p>
                </div>
            ) : (
                <div className="flex flex-col w-full h-full">
                    {/* Search and View Toggle Header */}
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="flex w-full gap-4 justify-between">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search projects..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <AddNewProject
                                onProjectCreated={refetch}
                                buttonSize="sm"
                                buttonVariant="default"
                            />
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            className="h-8 w-8 p-0"
                        >
                            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Columns className="h-4 w-4" />}
                        </Button>
                    </div>

                    {/* Projects Content */}
                    <div className="relative w-full flex-grow">
                        {isFetching && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10">
                                <Loading message="Updating..." size="sm" />
                            </div>
                        )}
                        
                        {viewMode === 'grid' ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {(projects.data || []).map((project) => (
                                    <ProjectSummaryCard 
                                        key={project.id} 
                                        item={project}
                                        onDelete={handleDeleteProject}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {(projects.data || []).map((project) => (
                                    <ProjectListItem 
                                        key={project.id} 
                                        item={project}
                                        onDelete={handleDeleteProject}
                                    />
                                ))}
                            </div>
                        )}
                        
                        {projects.data && projects.data.length === 0 && (
                            <div className="flex items-center justify-center h-32 text-muted-foreground">
                                <p>{searchTerm ? 'No projects match your search' : 'No projects found'}</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Pagination - only show if using API pagination (not when filtering) */}
                    {projects.meta && projects.meta.last_page > 1 && !searchTerm && (
                        <div className="mt-6">
                            <Pagination
                                currentPage={projects.meta.current_page}
                                totalPages={projects.meta.last_page}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Delete Project Dialog */}
            <DeleteProjectDialog
                project={deleteProject_}
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) {
                        setDeleteProject(null);
                    }
                }}
                onConfirm={handleConfirmDelete}
            />
        </div>
    )
}