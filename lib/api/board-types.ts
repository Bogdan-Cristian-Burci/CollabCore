import { BoardType } from '@/types/board-type';
import { PaginatedResponse } from '@/types/api';
import { api } from '@/lib/fetch-interceptor';

// Fetch board types from the API
export async function fetchBoardTypes(): Promise<PaginatedResponse<BoardType>> {
  try {
    const response = await api.get('/api/board-types');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch board types: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data as PaginatedResponse<BoardType>;
  } catch (error) {
    console.error('Error fetching board types:', error);
    throw error;
  }
}