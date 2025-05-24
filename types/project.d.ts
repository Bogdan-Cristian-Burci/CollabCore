import {UserResource} from "@/types/user";
import {OrganisationResource} from "@/types/organisation";
import { BoardResponse } from "@/types/board";

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

export interface SingleProjectResource{
    id: number;
    name: string;
    description: string;
    key: string;
    organisation_id: number;
    organisation: OrganisationResource;
    team_id: number | null;
    boards: BoardResponse[];
    tasks_count: number;
    created_at: string;
    updated_at: string;

}