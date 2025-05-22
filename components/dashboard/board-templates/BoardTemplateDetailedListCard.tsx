import { BoardTemplateResponse, BoardTemplateColumnStructure } from "@/types/board-templates";
import { cn } from "@/lib/utils";
import { LayoutTemplate, GripVertical, Columns, List, ChevronDown, ChevronRight } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface BoardTemplateDetailedListCardProps {
  className?: string;
  item: BoardTemplateResponse;
  isSystem?: boolean;
}

interface TestCard {
  id: string;
  title: string;
  columnId: string;
}

export default function BoardTemplateDetailedListCard({
  className,
  item,
  isSystem = false
}: BoardTemplateDetailedListCardProps) {
  const columns = item.column_structure || item.columns_structure || [];
  const [displayMode, setDisplayMode] = useState<'columns' | 'list'>('columns');
  const [collapsedColumns, setCollapsedColumns] = useState<Set<number>>(new Set());
  
  // Create sample test cards for demonstration - only for first column
  const [testCards, setTestCards] = useState<TestCard[]>(() => {
    const cards: TestCard[] = [];
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

  const getCardsForColumn = (columnId: string) => {
    return testCards.filter(card => card.columnId === columnId);
  };

  return (
    <div className={cn("h-full flex flex-col relative pt-8", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="h-5 w-5" />
          <h3 className="text-lg font-medium">{item.name}</h3>
          {isSystem && <span className="text-xs bg-muted px-2 py-1 rounded">System</span>}
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
      <p className="text-muted-foreground mb-4">{item.description}</p>
      
      {columns.length > 0 ? (
        displayMode === 'columns' ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {columns.map((column: BoardTemplateColumnStructure, index: number) => (
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
          </DragDropContext>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="space-y-2">
              {columns.map((column: BoardTemplateColumnStructure, index: number) => {
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
          </DragDropContext>
        )
      ) : (
        <div className="text-muted-foreground text-sm">
          No columns configured for this template.
        </div>
      )}
      
      <div className="text-muted-foreground text-xs mt-4 p-2 bg-muted/20 rounded">
        💡 Try dragging the test cards between columns to see how this board template works!
      </div>
    </div>
  );
}