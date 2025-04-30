export interface Permission {
  id: number;
  name: string;
  display_name: string;
  description: string;
  category: string;
  is_active: boolean;
  override_status?: 'granted' | 'denied' | 'inherited';
}

export interface PermissionsApiResponse {
  permissions: Permission[];
}