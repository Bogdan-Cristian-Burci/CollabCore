import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Project } from "@/types/project";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { FolderOpen, User, Calendar } from "lucide-react";

interface ProjectSummaryCardProps {
    className?: string;
    item: Project;
}

export default function ProjectSummaryCard({ className, item }: ProjectSummaryCardProps) {
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
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-auto">
                        {item.key}
                    </span>
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
                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <span className="text-xs">{item.responsible_user.initials}</span>
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