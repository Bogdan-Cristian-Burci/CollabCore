
import { SingleProjectResource } from "@/types/project";
import { cn } from "@/lib/utils";
import { FolderOpen, Plus, Loader2 } from "lucide-react";
import { DropResult } from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import BoardDisplay, { BoardColumn, BoardCard } from "@/components/ui/board-display";
import { useProject } from "@/lib/hooks/useProjects";

interface ProjectDetailedListCardProps {
    className?: string;
    item: { id: number };
}

export default function ProjectDetailedListCard({ className, item }: ProjectDetailedListCardProps) {
    const { project, isLoading, error } = useProject(item.id);
    
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

    if (isLoading) {
        return (
            <div className={cn("h-full flex flex-col items-center justify-center relative pt-8", className)}>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Loading project...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cn("h-full flex flex-col items-center justify-center relative pt-8", className)}>
                <p className="text-destructive">Failed to load project</p>
                <p className="text-muted-foreground text-sm mt-1">
                    {error instanceof Error ? error.message : 'Unknown error occurred'}
                </p>
            </div>
        );
    }

    if (!project) {
        return (
            <div className={cn("h-full flex flex-col items-center justify-center relative pt-8", className)}>
                <p className="text-muted-foreground">Project not found</p>
            </div>
        );
    }

    const additionalActions = (
        <>
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
        <div className={cn("h-full flex flex-col relative pt-8", className)}>
            <p className="text-muted-foreground mb-4">{project.description}</p>
            <div className="text-xs text-muted-foreground mb-4">
                Tasks: {project.tasks_count} | Organisation: {project.organisation?.name}
            </div>
            
            <BoardDisplay
                columns={columns}
                cards={cards}
                onDragEnd={onDragEnd}
                additionalActions={additionalActions}
                emptyStateText="No boards configured for this project."
                showTestHint={false}
            />
        </div>
    );
}