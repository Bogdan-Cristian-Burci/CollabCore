
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
export interface BoardTemplate{
    id:number;
    name:string;
    description:string;
    column_structure:BoardTemplateColumnStructure[];
    settings?:BoardTemplateSettings;
    transitions?:BoardTemplateTransitions[];
}