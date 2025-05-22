import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { BoardTemplateResponse } from "@/types/board-templates";
import { cn } from "@/lib/utils";
import { LayoutTemplate, Copy, Trash2, Columns, Calendar, ToggleLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import useBoardTemplates from "@/lib/hooks/useBoardTemplates";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface BoardTemplateDetailedCardProps {
  className?: string;
  item: BoardTemplateResponse;
  isSystem?: boolean;
}

export default function BoardTemplateDetailedCard({
  className,
  item,
  isSystem = false
}: BoardTemplateDetailedCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    useDuplicateBoardTemplate,
    useDeleteBoardTemplate,
    useToggleBoardTemplateActive
  } = useBoardTemplates();
  
  const { mutate: duplicateTemplate } = useDuplicateBoardTemplate();
  const { mutate: deleteTemplate } = useDeleteBoardTemplate();
  const { mutate: toggleActive } = useToggleBoardTemplateActive();

  const handleDuplicate = () => {
    setIsLoading(true);
    duplicateTemplate(item.id, {
      onSuccess: () => {
        toast.success("Board template duplicated successfully");
        setIsLoading(false);
      },
      onError: () => {
        toast.error("Failed to duplicate board template");
        setIsLoading(false);
      },
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this template?")) {
      setIsLoading(true);
      deleteTemplate(item.id, {
        onSuccess: () => {
          toast.success("Board template deleted successfully");
          setIsLoading(false);
        },
        onError: () => {
          toast.error("Failed to delete board template");
          setIsLoading(false);
        },
      });
    }
  };

  const handleToggleActive = () => {
    setIsLoading(true);
    toggleActive(item.id, {
      onSuccess: () => {
        toast.success("Board template status updated successfully");
        setIsLoading(false);
      },
      onError: () => {
        toast.error("Failed to update board template status");
        setIsLoading(false);
      },
    });
  };

  return (
        <>
          <div className={cn("flex items-center justify-between",className)}>
            <div className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5" />
              {item.name}
              {isSystem && <Badge variant="outline" className="ml-2">System</Badge>}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDuplicate}
                disabled={isLoading}
                title="Duplicate template"
              >
                <Copy className="h-4 w-4" />
              </Button>
              {!isSystem && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleToggleActive}
                    disabled={isLoading}
                    title="Toggle active status"
                  >
                    <ToggleLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDelete}
                    disabled={isLoading}
                    title="Delete template"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <div>{item.description}</div>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Columns className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {(item.column_structure || item.columns_structure || []).length} columns
              </span>
            </div>
            {item.settings && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {item.settings.track_cycle_time ? "Tracking cycle time" : "Not tracking cycle time"}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2">
            {(item.column_structure || item.columns_structure || []).map((column, index) => (
              <div
                key={index}
                className="p-2 rounded border"
                style={{
                  borderColor: column.color || 'var(--border)',
                  backgroundColor: column.color ? `${column.color}10` : undefined
                }}
              >
                <div className="font-medium">{column.name}</div>
                {column.wip_limit && (
                  <div className="text-xs text-muted-foreground">
                    WIP Limit: {column.wip_limit}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.settings && (
            <>
              {item.settings.allow_subtasks && <Badge variant="outline">Subtasks</Badge>}
              {item.settings.allow_wip_limit && <Badge variant="outline">WIP Limits</Badge>}
              {item.settings.show_assignee_avatars && <Badge variant="outline">Assignee Avatars</Badge>}
              {item.settings.enable_task_estimation && <Badge variant="outline">Estimations</Badge>}
            </>
          )}
        </div>
        </>
  );
}