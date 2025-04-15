import { api } from '@/lib/fetch-interceptor';

/**
 * Creates a standardized API module for a resource
 * This factory function ensures all resource API modules follow the same pattern
 * 
 * @param resourcePath The base path for the resource, e.g. '/api/users'
 */
export function createApiModule<
  TResource, 
  TCreateInput = Partial<TResource>,
  TUpdateInput = Partial<TResource>
>(resourcePath: string) {
  
  return {
    /**
     * Get all resources
     */
    getAll: async (): Promise<TResource[]> => {
      try {
        return await api.getJSON<TResource[]>(resourcePath);
      } catch (error) {
        console.error(`Error fetching ${resourcePath}:`, error);
        return [];
      }
    },

    /**
     * Get a single resource by ID
     */
    getById: async (id: string | number): Promise<TResource | null> => {
      try {
        return await api.getJSON<TResource>(`${resourcePath}/${id}`);
      } catch (error) {
        console.error(`Error fetching ${resourcePath}/${id}:`, error);
        return null;
      }
    },

    /**
     * Create a new resource
     */
    create: async (data: TCreateInput): Promise<TResource | null> => {
      try {
        return await api.postJSON<TResource>(resourcePath, data, {
          showSuccessToast: true,
          successMessage: 'Created successfully'
        });
      } catch (error) {
        console.error(`Error creating ${resourcePath}:`, error);
        return null;
      }
    },

    /**
     * Update an existing resource
     */
    update: async (id: string | number, data: TUpdateInput): Promise<TResource | null> => {
      try {
        return await api.patchJSON<TResource>(`${resourcePath}/${id}`, data, {
          showSuccessToast: true,
          successMessage: 'Updated successfully'
        });
      } catch (error) {
        console.error(`Error updating ${resourcePath}/${id}:`, error);
        return null;
      }
    },

    /**
     * Delete a resource
     */
    delete: async (id: string | number): Promise<boolean> => {
      try {
        await api.deleteJSON(`${resourcePath}/${id}`, {
          showSuccessToast: true,
          successMessage: 'Deleted successfully'
        });
        return true;
      } catch (error) {
        console.error(`Error deleting ${resourcePath}/${id}:`, error);
        return false;
      }
    },

    /**
     * Extended API for custom endpoints related to this resource
     * @param subPath The sub-path relative to the resource
     * @param method The HTTP method
     * @param data The request body, if any
     */
    custom: async <T>(subPath: string, method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', data?: any): Promise<T | null> => {
      try {
        const url = `${resourcePath}${subPath.startsWith('/') ? subPath : `/${subPath}`}`;
        
        switch (method) {
          case 'GET':
            return await api.getJSON<T>(url);
          case 'POST':
            return await api.postJSON<T>(url, data);
          case 'PUT':
            return await api.putJSON<T>(url, data);
          case 'PATCH':
            return await api.patchJSON<T>(url, data);
          case 'DELETE':
            return await api.deleteJSON<T>(url);
        }
      } catch (error) {
        console.error(`Error with custom ${method} request to ${resourcePath}${subPath}:`, error);
        return null;
      }
    }
  };
}

/**
 * Creates a standardized React Query key factory for a resource
 * This ensures consistent key structure across resources
 * 
 * @param resource The resource name, e.g. 'users'
 */
export function createQueryKeys(resource: string) {
  return {
    all: [resource] as const,
    lists: () => [...createQueryKeys(resource).all, 'list'] as const,
    list: (filters: any) => [...createQueryKeys(resource).lists(), { filters }] as const,
    details: () => [...createQueryKeys(resource).all, 'detail'] as const,
    detail: (id: string | number) => [...createQueryKeys(resource).details(), id] as const,
  };
}