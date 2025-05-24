import { BoardTemplateResponse } from "@/types/board-templates";
import { cn } from "@/lib/utils";
import { LayoutTemplate } from "lucide-react";
import { DropResult } from "@hello-pangea/dnd";
import { useState } from "react";
import BoardDisplay, { BoardColumn, BoardCard } from "@/components/ui/board-display";

interface BoardTemplateDetailedListCardProps {
  className?: string;
  item: BoardTemplateResponse;
  isSystem?: boolean;
}

export default function BoardTemplateDetailedListCard({
  className,
  item,
  isSystem = false
}: BoardTemplateDetailedListCardProps) {
  const columns: BoardColumn[] = (item.column_structure || item.columns_structure || []).map(col => ({
    name: col.name,
    color: col.color,
    wip_limit: col.wip_limit
  }));
  
  // Create sample test cards for demonstration - only for first column
  const [testCards, setTestCards] = useState<BoardCard[]>(() => {
    const cards: BoardCard[] = [];
    if (columns.length > 0) {
      for (let i = 0; i < 2; i++) {
        cards.push({
          id: `card-0-${i}`,
          title: `Test Task ${i + 1}`,
          columnId: `column-0`
        });
      }
    }
    return cards;
  });

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    setTestCards(prevCards => {
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

  return (
    <div className={cn("h-full flex flex-col relative pt-8", className)}>
      <div className="flex items-center gap-2 mb-4">
        <LayoutTemplate className="h-5 w-5" />
        <h3 className="text-lg font-medium">{item.name}</h3>
        {isSystem && <span className="text-xs bg-muted px-2 py-1 rounded">System</span>}
      </div>
      <p className="text-muted-foreground mb-4">{item.description}</p>
      
      <BoardDisplay
        columns={columns}
        cards={testCards}
        onDragEnd={onDragEnd}
        emptyStateText="No columns configured for this template."
        showTestHint={true}
      />
    </div>
  );
}