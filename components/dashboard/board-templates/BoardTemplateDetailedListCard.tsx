import { BoardTemplateResponse } from "@/types/board-templates";
import { cn } from "@/lib/utils";
import { LayoutTemplate } from "lucide-react";

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
  return (
    <div className={cn("h-full flex flex-col relative pt-8", className)}>
      <div className="flex items-center gap-2 mb-2">
        <LayoutTemplate className="h-5 w-5" />
        <h3 className="text-lg font-medium">{item.name}</h3>
        {isSystem && <span className="text-xs bg-muted px-2 py-1 rounded">System</span>}
      </div>
      <p className="text-muted-foreground">{item.description}</p>
      <div className="mt-2 text-sm">
        {(item.column_structure || item.columns_structure || []).length} columns
      </div>
      <div className="text-muted-foreground text-xs italic mt-4">
        This component will be enhanced with additional details in a future update.
      </div>
    </div>
  );
}