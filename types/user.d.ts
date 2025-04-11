import {JWT} from "next-auth/jwt";

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

export interface UserPermissions{
    update:boolean,
    delete:boolean,
    manage_roles:boolean,
}
export interface PermissionOverrides{
    grant:string[],
    deny:string[]
}

export interface LinksStructure{
    self:string,
    teams:string,
    projects:string,
    members:string,
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
    links:LinksStructure
}

export interface UserResource{
    id:number,
    name:string,
    email:string,
    email_verified_at:string | null,
    initials:string,
    created_at:string,
    updated_at:string,
    roles:string[],
    permissions:string[],
    permission_overrides:PermissionOverrides,
    organisation_id:number,
    organisation:OrganisationResource,
    can:UserPermissions,
    links:LinksStructure,
}

export interface LoginResponseResource{
    message:string,
    token:JWT,
    user:UserResource,
}