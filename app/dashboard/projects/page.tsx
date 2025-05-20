"use client";
import React from "react";
import {Project} from "@/types/project";
import {ExpandableWrapper} from "@/components/dashboard/ExpandableWrapper";
import ProjectSimpleCard from "@/components/dashboard/projects/ProjectSimpleCard";
import ProjectDetailedCard from "@/components/dashboard/projects/ProjectDetailedCard";
import ProjectDetailedListCard from "@/components/dashboard/projects/ProjectDetailedListCard";
import { useProjects } from "@/lib/hooks/useProjects";
import { Pagination } from "@/components/ui/pagination";

export default function ProjectsPage(){
    const { 
      projects, 
      pagination, 
      setPage, 
      setPerPage, 
      isLoading,
      isFetching,
      error 
    } = useProjects();
    
    return (
        <div className="flex flex-col gap-4 w-full h-full">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Projects</h2>
            </div>
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
                    <div className="relative flex w-full flex-grow">
                        {isFetching && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center">
                                <p>Loading...</p>
                            </div>
                        )}
                        <ExpandableWrapper<Project>
                            list={projects.data || []}
                            searchBy="name"
                            filterBy="organisation_id"
                            SimpleComponent={ProjectSimpleCard}
                            DetailedComponent={ProjectDetailedCard}
                            ListDetailedComponent={ProjectDetailedListCard}
                        />
                    </div>
                    
                    {projects.meta && (
                        <Pagination
                            currentPage={projects.meta.current_page}
                            totalPages={projects.meta.last_page}
                            onPageChange={setPage}
                            perPage={projects.meta.per_page}
                            onPerPageChange={setPerPage}
                            totalItems={projects.meta.total}
                        />
                    )}
                </div>
            )}
        </div>
    )
}