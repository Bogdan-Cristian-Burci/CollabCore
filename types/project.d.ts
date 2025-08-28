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
    status: 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled';
    end_date: string | null;
    start_date?: string | null;
    users: UserResource[];
    files?: ProjectFile[]; // Legacy - keeping for backward compatibility
    documents?: ProjectFile[]; // New media files from backend
    documents_count?: number;
    attachments?: ProjectFile[]; // New attachments from backend  
    attachments_count?: number;
    created_at: string;
    updated_at: string;
}

export interface ProjectFile {
    id: number;
    name: string;
    file_name?: string; // Backend provides this as well
    file_path?: string; // Legacy field
    url?: string; // New field from backend
    file_size?: number; // Legacy field
    size?: number; // New field from backend (in bytes)
    mime_type?: string;
    uploaded_by?: UserResource; // May not be provided by backend
    collection?: string; // "documents" or "attachments"
    created_at: string;
    conversions?: {
        thumbnail?: string;
        preview?: string;
    }; // Media library conversions
}