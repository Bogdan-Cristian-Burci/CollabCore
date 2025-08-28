import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Project } from "@/types/project";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { FolderOpen, User, Calendar, Trash2 } from "lucide-react";

interface ProjectListItemProps {
    className?: string;
    item: Project;
    onDelete?: (project: Project) => void;
}

export default function ProjectListItem({ className, item, onDelete }: ProjectListItemProps) {
    const router = useRouter();

    const handleSeeProject = () => {
        router.push(`/dashboard/projects/${item.id}`);
    };

    return (
        <div className={cn(
            "flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow bg-card",
            className
        )}>
            <div className="flex items-center gap-4 flex-1">
                <FolderOpen className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">{item.name}</h3>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex-shrink-0">
                            {item.key}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{item.tasks_count || 0} tasks</span>
                </div>
                
                <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{item.created_at || 'No date'}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs font-medium">
                            {item.responsible_user.initials}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-sm min-w-0 truncate max-w-24">
                        {item.responsible_user.name}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleSeeProject}
                        className="flex-shrink-0"
                    >
                        See Project
                    </Button>
                    
                    {onDelete && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item);
                            }}
                            title="Delete project"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete project</span>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}