import {Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter} from "@/components/ui/card";
import {Project} from "@/types/project";
import {cn} from "@/lib/utils";
import {BookUser, CalendarArrowUp, ClipboardList} from "lucide-react";

interface ProjectDetailedCardProps {
    className?:string;
    item:Project;
}
export default function ProjectDetailedCard({className, item}:ProjectDetailedCardProps) {
    return (

        <Card className={cn("border-0 shadow-none", className)}>
            <CardHeader>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col">
                <div className="flex justify-between">
                    <h4><BookUser/> Responsible: {item.responsible_user.name}</h4>
                    <h4><CalendarArrowUp/> Created at: {item.created_at}</h4>
                </div>
            </CardContent>
            <CardFooter>
                <h4><ClipboardList/> Total tasks: { item.tasks_count }</h4>
            </CardFooter>
        </Card>
    )
}