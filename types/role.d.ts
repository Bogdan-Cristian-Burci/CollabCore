export interface RolePermission {
  id: number;
  name: string;
  display_name: string;
  description: string;
  category: string;
  is_active:boolean;
}

export interface RoleUser {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  level: number;
  permissions: RolePermission[];
  users: RoleUser[];
  users_count: number;
  is_system_role: boolean;
  is_system?: boolean; // Alternate property name
  is_customized?: boolean; // Flag indicating if a system role has been customized
}

export interface RolesApiResponse {
  roles: Role[];
}