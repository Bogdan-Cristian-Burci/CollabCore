import {OrganisationsApiResponse, OrganisationResource} from "@/types/organisation";

// Fetch all organisations
export async function fetchOrganizations(): Promise<OrganisationResource[]> {
    try {
        // Use the Next.js API route directly
        const response = await fetch('/api/organisations', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            console.error('Failed to fetch organizations, status:', response.status);
            return [];
        }

        const organisations: OrganisationsApiResponse = await response.json();
        return organisations.data;

    } catch (error) {
        console.error('Error fetching organizations:', error);
        return [];
    }
}

// Fetch a specific organisation by ID
export async function fetchOrganisationById(id: string): Promise<OrganisationResource | null> {
    try {
        const response = await fetch(`/api/organisations/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            console.error(`Failed to fetch organization ${id}, status:`, response.status);
            return null;
        }

        const data = await response.json();
        return data.data;

    } catch (error) {
        console.error(`Error fetching organization ${id}:`, error);
        return null;
    }
}

// Create a new organisation
export async function createOrganisation(data: any): Promise<OrganisationResource | null> {
    try {
        const response = await fetch('/api/organisations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            console.error('Failed to create organization, status:', response.status);
            return null;
        }

        const result = await response.json();
        return result.data;

    } catch (error) {
        console.error('Error creating organization:', error);
        return null;
    }
}

// Update an organisation
export async function updateOrganisation(id: string, data: any): Promise<OrganisationResource | null> {
    try {
        const response = await fetch(`/api/organisations/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            console.error(`Failed to update organization ${id}, status:`, response.status);
            return null;
        }

        const result = await response.json();
        return result.data;

    } catch (error) {
        console.error(`Error updating organization ${id}:`, error);
        return null;
    }
}

// Delete an organisation
export async function deleteOrganisation(id: string): Promise<boolean> {
    try {
        const response = await fetch(`/api/organisations/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        return response.ok;

    } catch (error) {
        console.error(`Error deleting organization ${id}:`, error);
        return false;
    }
}