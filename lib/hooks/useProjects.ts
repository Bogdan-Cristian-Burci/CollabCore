import { Project, SingleProjectResource } from '@/types/project';
import { PaginationParams, PaginatedResponse } from '@/types/api';
import projectsApi, { fetchProjects, fetchProjectById } from '@/lib/api/projects';
import { createQueryKeys } from '@/lib/api-factory';
import { createResourceHooks } from '@/lib/query-hooks';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

// Create standardized query keys for projects
export const projectKeys = createQueryKeys('projects');

// Create standardized hooks for projects
const projectHooks = createResourceHooks<Project>(
  'projects',
  projectsApi,
  {
    all: projectKeys.all,
    detail: (id) => projectKeys.detail(id)
  }
);

/**
 * Hook to fetch and manage all projects data with pagination and search
 */
export function useProjects(initialPage: number = 1, initialPerPage: number = 10) {
  // State for pagination
  const [pagination, setPagination] = useState<PaginationParams>({
    page: initialPage,
    per_page: initialPerPage
  });
  
  // State for search
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Query with pagination parameters
  const { 
    data, 
    isLoading, 
    isFetching, 
    error, 
    refetch 
  } = useQuery({
    queryKey: [...projectKeys.all, pagination],
    queryFn: () => fetchProjects(pagination),
    // Add additional options for better reliability
    retry: 3,
    retryDelay: 1000,
    // Don't refetch on window focus to avoid unwanted refreshes
    refetchOnWindowFocus: false
  });
  
  const { mutate: createProject, isPending: isCreating, error: createError } = projectHooks.useCreate();
  const { mutate: deleteProjectMutation, isPending: isDeleting, error: deleteError } = projectHooks.useDelete();

  // Wrap delete mutation to match previous API
  const deleteProject = (id: number) => deleteProjectMutation(id);
  
  // Helper function to change page
  const setPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  // Helper function to change items per page
  const setPerPage = (per_page: number) => {
    setPagination(prev => ({ page: 1, per_page })); // Reset to first page when changing items per page
  };
  
  // Extract projects data and pagination metadata
  const rawProjects = data || { 
    data: [], 
    meta: {
      current_page: 1,
      from: 0,
      last_page: 1,
      links: [],
      path: '',
      per_page: initialPerPage,
      to: 0,
      total: 0
    },
    links: {
      first: '',
      last: '',
      prev: null,
      next: null
    }
  };

  // Apply client-side filtering for search
  const filteredData = searchTerm
    ? rawProjects.data.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.key.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : rawProjects.data;

  // Create filtered projects object with updated data
  const projects = {
    ...rawProjects,
    data: filteredData
  };

  return {
    projects, // This now contains data, meta, and links properties
    pagination,
    setPage,
    setPerPage,
    searchTerm,
    setSearchTerm,
    isLoading,
    isFetching,
    error,
    refetch,
    createProject,
    isCreating,
    createError,
    deleteProject,
    isDeleting,
    deleteError,
  };
}

/**
 * Hook to fetch and manage a single project by ID with full details
 */
export function useProject(id: number) {
  const queryClient = useQueryClient();
  
  const { 
    data: project, 
    isLoading, 
    isFetching, 
    error, 
    refetch 
  } = useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => fetchProjectById(id),
    retry: 3,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    enabled: !!id && id > 0
  });
  
  const { 
    mutate: updateProjectMutation, 
    isPending: isUpdating, 
    error: updateError 
  } = projectHooks.useUpdate();

  // Wrap update mutation to match previous API
  const updateProject = (data: Partial<Project>) => updateProjectMutation({ id, data });

  return {
    project,
    isLoading,
    isFetching,
    error,
    refetch,
    updateProject,
    isUpdating,
    updateError
  };
}

// Default export for backward compatibility
export default {
  ...projectHooks,
};