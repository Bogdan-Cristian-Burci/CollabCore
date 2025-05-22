import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllBoardTemplates, 
  getBoardTemplateById, 
  createBoardTemplate,
  updateBoardTemplate,
  deleteBoardTemplate,
  toggleBoardTemplateActive,
  duplicateBoardTemplate,
  getSystemBoardTemplates
} from '@/lib/api/board-templates';
import { 
  BoardTemplateCreate, 
  BoardTemplateResponse, 
  BoardTemplateUpdate 
} from '@/types/board-templates';

// Query keys for board templates
const boardTemplateKeys = {
  all: ['board-templates'] as const,
  lists: () => [...boardTemplateKeys.all, 'list'] as const,
  list: (filters: string) => [...boardTemplateKeys.lists(), { filters }] as const,
  details: () => [...boardTemplateKeys.all, 'detail'] as const,
  detail: (id: string) => [...boardTemplateKeys.details(), id] as const,
  system: () => [...boardTemplateKeys.all, 'system'] as const,
};

export function useBoardTemplates() {
  const queryClient = useQueryClient();

  // Fetch all board templates
  const useAllBoardTemplates = (includeSystem = true) => {
    return useQuery({
      queryKey: boardTemplateKeys.list(`include_system=${includeSystem}`),
      queryFn: async () => {
        const result = await getAllBoardTemplates(includeSystem);
        // Handle case where API returns { data: [...] } structure
        return Array.isArray(result) ? result : (result?.data || []);
      },
    });
  };

  // Fetch a single board template by ID
  const useBoardTemplate = (id?: string) => {
    return useQuery({
      queryKey: boardTemplateKeys.detail(id || 'undefined'),
      queryFn: () => (id ? getBoardTemplateById(id) : Promise.resolve(null)),
      enabled: !!id,
    });
  };

  // Fetch only system board templates
  const useSystemBoardTemplates = () => {
    return useQuery({
      queryKey: boardTemplateKeys.system(),
      queryFn: async () => {
        const result = await getSystemBoardTemplates();
        // Handle case where API returns { data: [...] } structure
        return Array.isArray(result) ? result : (result?.data || []);
      },
    });
  };

  // Create a new board template
  const useCreateBoardTemplate = () => {
    return useMutation({
      mutationFn: (data: BoardTemplateCreate) => createBoardTemplate(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: boardTemplateKeys.lists() });
      },
    });
  };

  // Update an existing board template
  const useUpdateBoardTemplate = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: BoardTemplateUpdate }) => 
        updateBoardTemplate(id, data),
      onSuccess: (updatedTemplate, { id }) => {
        if (updatedTemplate) {
          queryClient.setQueryData(boardTemplateKeys.detail(id), updatedTemplate);
          queryClient.invalidateQueries({ queryKey: boardTemplateKeys.lists() });
        }
      },
    });
  };

  // Delete a board template
  const useDeleteBoardTemplate = () => {
    return useMutation({
      mutationFn: (id: string) => deleteBoardTemplate(id),
      onSuccess: (success, id) => {
        if (success) {
          queryClient.removeQueries({ queryKey: boardTemplateKeys.detail(id) });
          queryClient.invalidateQueries({ queryKey: boardTemplateKeys.lists() });
        }
      },
    });
  };

  // Toggle board template active status
  const useToggleBoardTemplateActive = () => {
    return useMutation({
      mutationFn: (id: string) => toggleBoardTemplateActive(id),
      onSuccess: (updatedTemplate, id) => {
        if (updatedTemplate) {
          queryClient.setQueryData(boardTemplateKeys.detail(id), updatedTemplate);
          queryClient.invalidateQueries({ queryKey: boardTemplateKeys.lists() });
        }
      },
    });
  };

  // Duplicate a board template
  const useDuplicateBoardTemplate = () => {
    return useMutation({
      mutationFn: (id: string) => duplicateBoardTemplate(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: boardTemplateKeys.lists() });
      },
    });
  };

  return {
    useAllBoardTemplates,
    useBoardTemplate,
    useSystemBoardTemplates,
    useCreateBoardTemplate,
    useUpdateBoardTemplate,
    useDeleteBoardTemplate,
    useToggleBoardTemplateActive,
    useDuplicateBoardTemplate,
  };
}

// Export a default instance for easier imports
export default useBoardTemplates;