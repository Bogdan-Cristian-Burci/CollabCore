import {UserResource} from "@/types/user";

export interface Project{
    id:number,
    name:string,
    description:string,
    key:string,
    organisation_id:number,
    team_id?:number,
    responsible_user:UserResource,
    tasks_count?:number,
    created_at:string,
    updated_at:string,
}