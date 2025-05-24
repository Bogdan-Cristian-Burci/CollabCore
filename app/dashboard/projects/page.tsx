"use client";
import React, { useState } from "react";
import {Project} from "@/types/project";
import ProjectSummaryCard from "@/components/dashboard/projects/ProjectSummaryCard";
import ProjectListItem from "@/components/dashboard/projects/ProjectListItem";
import { useProjects } from "@/lib/hooks/useProjects";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Grid3X3, List } from "lucide-react";

export default function ProjectsPage(){
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
    const { 
      projects, 
      pagination, 
      setPage, 
      setPerPage, 
      searchTerm,
      setSearchTerm,
      isLoading,
      isFetching,
      error 
    } = useProjects();
    
    return (
        <div className="flex flex-col gap-4 w-full h-full">
            {isLoading ? (
                <div className="flex items-center justify-center h-32">
                    <p>Loading projects...</p>
                </div>
            ) : error ? (
                <div className="flex items-center justify-center h-32 text-red-500">
                    <p>Error loading projects: {error.message}</p>
                </div>
            ) : (
                <div className="flex flex-col w-full h-full">
                    {/* Search and View Toggle Header */}
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        
                        <div className="flex items-center gap-1 border rounded-md">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className="rounded-r-none"
                            >
                                <Grid3X3 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className="rounded-l-none"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Projects Content */}
                    <div className="relative w-full flex-grow">
                        {isFetching && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center">
                                <p>Loading...</p>
                            </div>
                        )}
                        
                        {viewMode === 'grid' ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {(projects.data || []).map((project) => (
                                    <ProjectSummaryCard key={project.id} item={project} />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {(projects.data || []).map((project) => (
                                    <ProjectListItem key={project.id} item={project} />
                                ))}
                            </div>
                        )}
                        
                        {projects.data && projects.data.length === 0 && (
                            <div className="flex items-center justify-center h-32 text-muted-foreground">
                                <p>{searchTerm ? 'No projects match your search' : 'No projects found'}</p>
                            </div>
                        )}
                    </div>ex
                    
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
        </div>
    )
}