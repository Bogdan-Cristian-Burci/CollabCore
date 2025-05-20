
import { Project } from "@/types/project";
import {cn} from "@/lib/utils";
interface ProjectDetailedListCardProps {
    className?: string;
    item:Project;
}
export default function ProjectDetailedListCard({className, item}: ProjectDetailedListCardProps){

    return (
        <div className={cn("h-full flex flex-col relative pt-8",className)}>
            <h4>project list detailed</h4>
        </div>
    )
}