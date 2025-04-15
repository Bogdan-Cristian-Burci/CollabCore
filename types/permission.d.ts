export interface Permission {
  id: number;
  name: string;
  display_name: string;
  description: string;
  category: string;
}

export interface PermissionsApiResponse {
  permissions: Permission[];
}