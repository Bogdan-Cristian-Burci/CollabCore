import { useQuery } from '@tanstack/react-query';
import { fetchBoardTypes } from '@/lib/api/board-types';

export function useBoardTypes() {
  return useQuery({
    queryKey: ['board-types'],
    queryFn: fetchBoardTypes
  });
}