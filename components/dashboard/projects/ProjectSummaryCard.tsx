import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Project } from "@/types/project";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { FolderOpen, User, Calendar, Trash2 } from "lucide-react";

interface ProjectSummaryCardProps {
    className?: string;
    item: Project;
    onDelete?: (project: Project) => void;
}

export default function ProjectSummaryCard({ className, item, onDelete }: ProjectSummaryCardProps) {
    const router = useRouter();

    const handleSeeProject = () => {
        router.push(`/dashboard/projects/${item.id}`);
    };

    return (
        <Card className={cn("hover:shadow-md transition-shadow", className)}>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {item.key}
                        </span>
                        {onDelete && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
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
                <CardDescription className="line-clamp-2">{item.description}</CardDescription>
            </CardHeader>
            
            <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>Tasks: {item.tasks_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{item.created_at || 'No date'}</span>
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs font-medium">
                            {item.responsible_user.initials}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                        {item.responsible_user.name}
                    </span>
                </div>
                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSeeProject}
                >
                    See Project
                </Button>
            </CardFooter>
        </Card>
    );
}