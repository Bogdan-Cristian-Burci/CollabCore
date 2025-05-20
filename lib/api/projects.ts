import { Project } from '@/types/project';
import { PaginatedResponse, PaginationParams } from '@/types/api';
import { createApiModule } from '@/lib/api-factory';
import { api } from '@/lib/fetch-interceptor';
import { toast } from 'sonner';

// Create a typed API module for projects
const projectsApi = createApiModule<Project>('/api/projects');

// Fetch projects from the API with pagination support
export async function fetchProjects(params?: PaginationParams): Promise<PaginatedResponse<Project>> {
  try {
    // Build the URL with pagination parameters
    const url = new URL('/api/projects', window.location.origin);
    
    if (params?.page) {
      url.searchParams.append('page', params.page.toString());
    }
    
    if (params?.per_page) {
      url.searchParams.append('per_page', params.per_page.toString());
    }
    
    // Use direct fetch which is proven to work correctly
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Handle the known response format from this API endpoint
    if (data.data && Array.isArray(data.data)) {
      return data as PaginatedResponse<Project>;
    }
    
    // For backward compatibility with non-paginated responses
    let processedData: PaginatedResponse<Project>;
    
    if (data.projects && Array.isArray(data.projects)) {
      processedData = {
        data: data.projects,
        meta: {
          current_page: 1,
          from: 1,
          last_page: 1,
          links: [],
          path: url.pathname,
          per_page: data.projects.length,
          to: data.projects.length,
          total: data.projects.length
        },
        links: {
          first: url.toString(),
          last: url.toString(),
          prev: null,
          next: null
        }
      };
      return processedData;
    }
    
    // Fallback logic for array responses
    if (Array.isArray(data)) {
      processedData = {
        data: data,
        meta: {
          current_page: 1,
          from: 1,
          last_page: 1,
          links: [],
          path: url.pathname,
          per_page: data.length,
          to: data.length,
          total: data.length
        },
        links: {
          first: url.toString(),
          last: url.toString(),
          prev: null,
          next: null
        }
      };
      return processedData;
    }
    
    // Unexpected format, but try to handle it gracefully
    return {
      data: [],
      meta: {
        current_page: 1,
        from: 0,
        last_page: 1,
        links: [],
        path: url.pathname,
        per_page: 10,
        to: 0,
        total: 0
      },
      links: {
        first: url.toString(),
        last: url.toString(),
        prev: null,
        next: null
      }
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error; // Let React Query handle the error
  }
}

// Get a single project by ID
export const fetchProjectById = projectsApi.getById;

// Create a new project
export const createProject = projectsApi.create;

// Update an existing project
export const updateProject = projectsApi.update;

// Delete a project
export const deleteProject = projectsApi.delete;

// Export the entire API module for direct use
export default {
  ...projectsApi,
  getAll: fetchProjects, // Override the getAll method with our custom implementation
};