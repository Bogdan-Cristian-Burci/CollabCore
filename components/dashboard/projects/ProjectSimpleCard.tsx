import {Card, CardHeader, CardTitle, CardDescription, CardFooter} from "@/components/ui/card";
import {Avatar} from "@/components/ui/avatar";
import {Project} from "@/types/project";
import {cn} from "@/lib/utils";

interface ProjectSimpleCardProps{
    className?: string;
    item: Project;
}
export default function ProjectSimpleCard({className, item}: ProjectSimpleCardProps) {
    return (
        <Card className={cn("border-0 shadow-none", className)}>
            <CardHeader>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardFooter>
                <div>
                    <Avatar>{item.responsible_user.initials}</Avatar>
                </div>
            </CardFooter>
        </Card>
    );
}