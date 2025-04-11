import {
    LinksStructure,
    UserPermissionsInOrganisation,
    UserRoleInOrganisation
} from "@/types/user";
import {ApiMeta, PaginationResource} from "@/types/api";

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
    is_active:boolean,
    user_role:UserRoleInOrganisation,
    can:UserPermissionsInOrganisation,
    links:LinksStructure
}
export interface OrganisationsApiResponse{
    data: OrganisationResource[],
    links:PaginationResource,
    meta: ApiMeta;
}