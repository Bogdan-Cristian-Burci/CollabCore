
export interface UserRoleInOrganisation{
    id:number | null,
    name:string,
    level:number,
    pivot_role:boolean,
    template:number | null,
}

export interface UserPermissionsInOrganisation{
    update:boolean,
    delete:boolean,
    invite_users:boolean,
    manage_settings:boolean,
}
export interface OrganisationResource{
    id:number,
    name:string,
    slug:string,
    unique_id:string,
    description:string,
    logo:string,
    address:string,
    website:string,
    created_by:number,
    owner_id:number,
    created_at:string,
    updated_at:string,
    user_role:UserRoleInOrganisation,
    can:UserPermissionsInOrganisation,
}