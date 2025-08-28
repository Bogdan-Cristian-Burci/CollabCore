import { cn } from "@/lib/utils";
import { GripVertical, Columns, List, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";

export interface BoardColumn {
  name: string;
  color?: string;
  wip_limit?: number;
}

export interface BoardCard {
  id: string;
  title: string;
  columnId: string;
}

interface BoardDisplayProps {
  columns: BoardColumn[];
  cards: BoardCard[];
  onDragEnd: (result: DropResult) => void;
  onCardUpdate?: (cards: BoardCard[]) => void;
  className?: string;
  additionalActions?: ReactNode;
  emptyStateText?: string;
  showTestHint?: boolean;
}

export default function BoardDisplay({
  columns,
  cards,
  onDragEnd,
  onCardUpdate,
  className,
  additionalActions,
  emptyStateText = "No columns configured.",
  showTestHint = false
}: BoardDisplayProps) {
  const [displayMode, setDisplayMode] = useState<'columns' | 'list'>('columns');
  const [collapsedColumns, setCollapsedColumns] = useState<Set<number>>(new Set());

  const toggleColumnCollapse = (columnIndex: number) => {
    setCollapsedColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnIndex)) {
        newSet.delete(columnIndex);
      } else {
        newSet.add(columnIndex);
      }
      return newSet;
    });
  };

  const getCardsForColumn = (columnId: string) => {
    return cards.filter(card => card.columnId === columnId);
  };

  if (columns.length === 0) {
    return (
      <div className={cn("text-muted-foreground text-sm", className)}>
        {emptyStateText}
      </div>
    );
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <div className="flex items-center justify-between mb-4 w-full gap-2">
        <div className="flex items-center gap-2 w-full">
          {additionalActions}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDisplayMode(displayMode === 'columns' ? 'list' : 'columns')}
          className="h-8 w-8 p-0"
        >
          {displayMode === 'columns' ? <List className="h-4 w-4" /> : <Columns className="h-4 w-4" />}
        </Button>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        {displayMode === 'columns' ? (
          <div className="flex gap-4 overflow-x-auto pb-4 h-full">
            {columns.map((column: BoardColumn, index: number) => (
              <div
                key={`column-${index}`}
                className="min-w-[250px] bg-muted/30 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: column.color || '#94a3b8' }}
                  />
                  <h4 className="font-medium text-sm">{column.name}</h4>
                  {column.wip_limit && (
                    <span className="text-xs bg-orange-100 text-orange-800 px-1 rounded">
                      WIP: {column.wip_limit}
                    </span>
                  )}
                </div>
                
                <Droppable droppableId={`column-${index}`}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "min-h-[150px] space-y-2 transition-colors",
                        snapshot.isDraggingOver && "bg-muted/50"
                      )}
                    >
                      {getCardsForColumn(`column-${index}`).map((card, cardIndex) => (
                        <Draggable key={card.id} draggableId={card.id} index={cardIndex}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                "bg-background border rounded-md p-3 cursor-grab active:cursor-grabbing shadow-sm",
                                "hover:shadow-md transition-shadow",
                                snapshot.isDragging && "rotate-2 shadow-lg"
                              )}
                            >
                              <div className="flex items-start gap-2">
                                <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <span className="text-sm">{card.title}</span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {columns.map((column: BoardColumn, index: number) => {
              const isCollapsed = collapsedColumns.has(index);
              return (
                <div
                  key={`list-column-${index}`}
                  className="bg-muted/30 rounded-lg overflow-hidden"
                >
                  <div 
                    className={cn(
                      "flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/40 transition-colors"
                    )}
                    onClick={() => toggleColumnCollapse(index)}
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: column.color || '#94a3b8' }}
                    />
                    <span className="font-medium text-sm flex-shrink-0">{column.name}</span>
                    {column.wip_limit && (
                      <span className="text-xs bg-orange-100 text-orange-800 px-1 rounded flex-shrink-0">
                        WIP: {column.wip_limit}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {getCardsForColumn(`column-${index}`).length} tasks
                    </span>
                  </div>
                  
                  {!isCollapsed && (
                    <div className="px-3 pb-3">
                      <Droppable droppableId={`column-${index}`}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={cn(
                              "min-h-[60px] space-y-2 p-2 rounded transition-colors border-2 border-dashed border-transparent",
                              snapshot.isDraggingOver && "border-muted-foreground/30 bg-muted/20"
                            )}
                          >
                            {getCardsForColumn(`column-${index}`).map((card, cardIndex) => (
                              <Draggable key={card.id} draggableId={card.id} index={cardIndex}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={cn(
                                      "bg-background border-l-4 rounded-r-md pl-3 pr-2 py-2 shadow-sm",
                                      "hover:shadow-md transition-all flex items-center gap-2 text-sm select-none",
                                      snapshot.isDragging && "rotate-1 shadow-lg opacity-80 z-50"
                                    )}
                                    style={{
                                      borderLeftColor: column.color || '#94a3b8',
                                      ...provided.draggableProps.style
                                    }}
                                  >
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-grab active:cursor-grabbing"
                                    >
                                      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    </div>
                                    <span className="flex-1 pointer-events-none">{card.title}</span>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            {getCardsForColumn(`column-${index}`).length === 0 && (
                              <div className="text-muted-foreground text-xs text-center py-4">
                                No tasks in this column
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                  
                  {isCollapsed && (
                    <Droppable droppableId={`column-${index}`}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={cn(
                            "h-8 mx-3 mb-2 rounded transition-colors border-2 border-dashed border-transparent",
                            snapshot.isDraggingOver && "border-muted-foreground/50 bg-muted/30"
                          )}
                        >
                          {provided.placeholder}
                          {snapshot.isDraggingOver && (
                            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                              Drop here
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DragDropContext>
      
      {showTestHint && (
        <div className="text-muted-foreground text-xs mt-4 p-2 bg-muted/20 rounded">
          💡 Try dragging the test cards between columns to see how this board template works!
        </div>
      )}
    </div>
  );
}