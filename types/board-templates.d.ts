
export interface BoardTemplateColumnStructure{
    name:string;
    color?:string;
    wip_limit?:number;
    status_id?:number;
}

export interface BoardTemplateSettings{
    default_view:string;
    allow_subtasks:boolean;
    allow_wip_limit:boolean;
    track_cycle_time:boolean;
    show_assignee_avatars:boolean;
    enable_task_estimation:boolean;
}

export interface BoardTemplateTransitions{
    from_status_id:number;
    to_status_id:number;
    name:string;
}
export interface BoardTemplateBase{
    name:string;
    description:string;
    column_structure:BoardTemplateColumnStructure[];
    settings?:BoardTemplateSettings;
    transitions?:BoardTemplateTransitions[];
}

// For POST/PATCH requests (without IDs)
export interface BoardTemplateCreate extends BoardTemplateBase {
    // No additional fields needed for creation
}

// For GET responses (with IDs)
export interface BoardTemplateResponse extends Omit<BoardTemplateBase, 'column_structure'> {
    id: string | number;
    organisation_id?: string;
    // API might return either column_structure or columns_structure
    column_structure?: BoardTemplateColumnStructure[];
    columns_structure?: BoardTemplateColumnStructure[];
    is_system?: boolean;
    is_active?: boolean;
    can?: {
        update: boolean;
        delete: boolean;
        duplicate: boolean;
    }
}

// Type alias for backwards compatibility
export type BoardTemplate = BoardTemplateBase;
export type BoardTemplateUpdate = Partial<BoardTemplateCreate>;