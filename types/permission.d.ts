export interface Permission {
  id: number;
  name: string;
  display_name: string;
  description: string;
  category: string;
  is_active: boolean;
}

export interface PermissionsApiResponse {
  permissions: Permission[];
}