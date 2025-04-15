import { 
  UseQueryOptions, 
  UseMutationOptions, 
  useQuery, 
  useMutation, 
  useQueryClient 
} from '@tanstack/react-query';

/**
 * Creates a standardized set of hooks for a resource
 * This factory ensures consistent hook patterns across resources
 */
export function createResourceHooks<
  TResource,
  TCreateInput = Partial<TResource>,
  TUpdateInput = Partial<TResource>
>(
  resourceName: string,
  resourceApi: {
    getAll: () => Promise<TResource[]>;
    getById: (id: string | number) => Promise<TResource | null>;
    create: (data: TCreateInput) => Promise<TResource | null>;
    update: (id: string | number, data: TUpdateInput) => Promise<TResource | null>;
    delete: (id: string | number) => Promise<boolean>;
  },
  queryKeys: {
    all: readonly unknown[];
    detail: (id: string | number) => readonly unknown[];
  }
) {
  // Get the query client outside the hooks to avoid re-creating inside each hook
  const getQueryClient = () => useQueryClient();

  return {
    /**
     * Hook to fetch all resources
     */
    useGetAll: (options?: Omit<UseQueryOptions<TResource[], Error>, 'queryKey' | 'queryFn'>) => {
      return useQuery<TResource[], Error>({
        queryKey: queryKeys.all,
        queryFn: resourceApi.getAll,
        ...options
      });
    },

    /**
     * Hook to fetch a single resource by ID
     */
    useGetById: (
      id: string | number | null | undefined,
      options?: Omit<UseQueryOptions<TResource | null, Error>, 'queryKey' | 'queryFn' | 'enabled'>
    ) => {
      return useQuery<TResource | null, Error>({
        queryKey: id ? queryKeys.detail(id) : [...queryKeys.all, 'detail', null],
        queryFn: () => (id ? resourceApi.getById(id) : Promise.resolve(null)),
        enabled: !!id,
        ...options
      });
    },

    /**
     * Hook for creating a new resource
     */
    useCreate: (
      options?: Omit<UseMutationOptions<TResource | null, Error, TCreateInput>, 'mutationFn'>
    ) => {
      const queryClient = getQueryClient();

      return useMutation<TResource | null, Error, TCreateInput>({
        mutationFn: (data) => resourceApi.create(data),
        onSuccess: (newResource) => {
          // Invalidate the list query to refresh it
          queryClient.invalidateQueries({ queryKey: queryKeys.all });
          options?.onSuccess?.(newResource, {} as TCreateInput, undefined);
        },
        ...options
      });
    },

    /**
     * Hook for updating an existing resource
     */
    useUpdate: (
      options?: Omit<UseMutationOptions<TResource | null, Error, { id: string | number; data: TUpdateInput }>, 'mutationFn'>
    ) => {
      const queryClient = getQueryClient();

      return useMutation<TResource | null, Error, { id: string | number; data: TUpdateInput }>({
        mutationFn: ({ id, data }) => resourceApi.update(id, data),
        onSuccess: (updatedResource, { id }) => {
          if (updatedResource) {
            // Update the detail query directly
            queryClient.setQueryData(queryKeys.detail(id), updatedResource);
            // Invalidate the list query to refresh it
            queryClient.invalidateQueries({ queryKey: queryKeys.all });
          }
          options?.onSuccess?.(updatedResource, { id, data: {} as TUpdateInput }, undefined);
        },
        ...options
      });
    },

    /**
     * Hook for deleting a resource
     */
    useDelete: (
      options?: Omit<UseMutationOptions<boolean, Error, string | number>, 'mutationFn'>
    ) => {
      const queryClient = getQueryClient();

      return useMutation<boolean, Error, string | number>({
        mutationFn: (id) => resourceApi.delete(id),
        onSuccess: (success, id) => {
          if (success) {
            // Remove from cache
            queryClient.removeQueries({ queryKey: queryKeys.detail(id) });
            // Invalidate the list query to refresh it
            queryClient.invalidateQueries({ queryKey: queryKeys.all });
          }
          options?.onSuccess?.(success, id, undefined);
        },
        ...options
      });
    }
  };
}