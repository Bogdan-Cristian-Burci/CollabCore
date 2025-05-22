import { 
  BoardTemplateCreate, 
  BoardTemplateResponse, 
  BoardTemplateUpdate
} from "@/types/board-templates";

const BASE_PATH = "/api/board-templates";

/**
 * Fetch all board templates including system templates if specified
 */
export async function getAllBoardTemplates(includeSystem = true): Promise<BoardTemplateResponse[]> {
  try {
    const response = await fetch(`${BASE_PATH}?include_system=${includeSystem}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch board templates");
    }

    const result = await response.json();
    // Return either direct array or nested data if present
    return result?.data || result;
  } catch (error) {
    console.error("Error fetching board templates:", error);
    return [];
  }
}

/**
 * Fetch a specific board template by ID
 */
export async function getBoardTemplateById(id: string): Promise<BoardTemplateResponse | null> {
  try {
    const response = await fetch(`${BASE_PATH}/${id}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch board template with ID ${id}`);
    }

    const result = await response.json();
    // Return either direct array or nested data if present
    return result?.data || result;
  } catch (error) {
    console.error("Error fetching board template:", error);
    return null;
  }
}

/**
 * Create a new board template
 */
export async function createBoardTemplate(data: BoardTemplateCreate): Promise<BoardTemplateResponse | null> {
  try {
    const response = await fetch(BASE_PATH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create board template");
    }

    const result = await response.json();
    // Return either direct array or nested data if present
    return result?.data || result;
  } catch (error) {
    console.error("Error creating board template:", error);
    return null;
  }
}

/**
 * Update an existing board template
 */
export async function updateBoardTemplate(
  id: string,
  data: BoardTemplateUpdate
): Promise<BoardTemplateResponse | null> {
  try {
    const response = await fetch(`${BASE_PATH}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update board template with ID ${id}`);
    }

    const result = await response.json();
    // Return either direct array or nested data if present
    return result?.data || result;
  } catch (error) {
    console.error("Error updating board template:", error);
    return null;
  }
}

/**
 * Delete a board template
 */
export async function deleteBoardTemplate(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_PATH}/${id}`, {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error("Error deleting board template:", error);
    return false;
  }
}

/**
 * Toggle the active status of a board template
 */
export async function toggleBoardTemplateActive(id: string): Promise<BoardTemplateResponse | null> {
  try {
    const response = await fetch(`${BASE_PATH}/${id}/toggle-active`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to toggle active status for board template with ID ${id}`);
    }

    const result = await response.json();
    // Return either direct array or nested data if present
    return result?.data || result;
  } catch (error) {
    console.error("Error toggling board template active status:", error);
    return null;
  }
}

/**
 * Duplicate an existing board template
 */
export async function duplicateBoardTemplate(id: string): Promise<BoardTemplateResponse | null> {
  try {
    const response = await fetch(`${BASE_PATH}/${id}/duplicate`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to duplicate board template with ID ${id}`);
    }

    const result = await response.json();
    // Return either direct array or nested data if present
    return result?.data || result;
  } catch (error) {
    console.error("Error duplicating board template:", error);
    return null;
  }
}

/**
 * Fetch only system board templates
 */
export async function getSystemBoardTemplates(): Promise<BoardTemplateResponse[]> {
  try {
    const response = await fetch(`${BASE_PATH}/system`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch system board templates");
    }

    const result = await response.json();
    // Return either direct array or nested data if present
    return result?.data || result;
  } catch (error) {
    console.error("Error fetching system board templates:", error);
    return [];
  }
}