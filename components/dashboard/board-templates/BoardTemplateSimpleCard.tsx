import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { BoardTemplateResponse } from "@/types/board-templates";
import { cn } from "@/lib/utils";
import { LayoutTemplate, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import useBoardTemplates from "@/lib/hooks/useBoardTemplates";
import { toast } from "sonner";

interface BoardTemplateSimpleCardProps {
  className?: string;
  item: BoardTemplateResponse;
  isSystem?: boolean;
}

export default function BoardTemplateSimpleCard({ 
  className, 
  item,
  isSystem = false
}: BoardTemplateSimpleCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    useDuplicateBoardTemplate,
    useDeleteBoardTemplate
  } = useBoardTemplates();
  
  const { mutate: duplicateTemplate } = useDuplicateBoardTemplate();
  const { mutate: deleteTemplate } = useDeleteBoardTemplate();

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

  return (
        <>
          <div className={cn("flex items-center justify-between",className)}>
            <div className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5" />
              {item.name}
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
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDelete}
                  disabled={isLoading}
                  title="Delete template"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>
          <div>{item.description}</div>
          <div className="text-sm text-muted-foreground">
            {/* Handle both column_structure and columns_structure */}
            {(item.column_structure || item.columns_structure || []).length} columns
          </div>
        </>
  );
}