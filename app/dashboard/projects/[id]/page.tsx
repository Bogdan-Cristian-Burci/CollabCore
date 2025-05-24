"use client";

import React from "react";
import { useParams } from "next/navigation";
import { SingleProjectResource } from "@/types/project";
import { cn } from "@/lib/utils";
import { FolderOpen, Plus, Loader2, ArrowLeft } from "lucide-react";
import { DropResult } from "@hello-pangea/dnd";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import BoardDisplay, { BoardColumn, BoardCard } from "@/components/ui/board-display";
import { useProject } from "@/lib/hooks/useProjects";
import { useRouter } from "next/navigation";

export default function ProjectPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = parseInt(params.id as string);
    
    const { project, isLoading, error } = useProject(projectId);
    
    // Initialize with empty cards - tasks will be fetched later
    const [cards, setCards] = useState<BoardCard[]>([]);

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

    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Loading project...</p>
            </div>
        );
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

    const additionalActions = (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="mr-2"
            >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
            </Button>
            <FolderOpen className="h-5 w-5" />
            <h3 className="text-lg font-medium">{project.name}</h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {project.key}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={handleCreateTask}
                className="ml-auto"
            >
                <Plus className="h-4 w-4 mr-1" />
                Create Task
            </Button>
        </>
    );

    return (
        <div className="h-full flex flex-col">
            <div className="mb-4">
                <p className="text-muted-foreground mb-2">{project.description}</p>
                <div className="text-xs text-muted-foreground">
                    Tasks: {project.tasks_count} | Organisation: {project.organisation?.name}
                </div>
            </div>
            
            <div className="flex-1">
                <BoardDisplay
                    columns={columns}
                    cards={cards}
                    onDragEnd={onDragEnd}
                    additionalActions={additionalActions}
                    emptyStateText="No boards configured for this project."
                    showTestHint={false}
                />
            </div>
        </div>
    );
}