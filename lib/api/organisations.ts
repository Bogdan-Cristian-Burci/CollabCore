import { OrganisationResource } from "@/types/organisation";
import { createApiModule } from '@/lib/api-factory';

// Create a typed API module for organizations
const organisationsApi = createApiModule<OrganisationResource>('/api/organisations');

// Re-export the standardized API functions with preserved names for backward compatibility
export const fetchOrganizations = organisationsApi.getAll;
export const fetchOrganisationById = organisationsApi.getById;
export const createOrganisation = organisationsApi.create;
export const updateOrganisation = organisationsApi.update;
export const deleteOrganisation = organisationsApi.delete;

// Export the entire API module for direct use
export default organisationsApi;