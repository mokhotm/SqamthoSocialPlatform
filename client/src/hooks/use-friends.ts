import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';

interface Friend {
  id: number;
  username: string;
  displayName: string;
  profilePicture?: string;
  mutualFriends?: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export function useFriends() {
  return useQuery({
    queryKey: ['friends'],
    queryFn: () => api.get<Friend[]>(API_CONFIG.ENDPOINTS.FRIENDS),
  });
}

export function useFriendRequests() {
  return useQuery({
    queryKey: ['friendRequests'],
    queryFn: async () => {
      const response = await api.get<Friend[]>(API_CONFIG.ENDPOINTS.FRIEND_REQUESTS);
      console.log('Friend requests response:', response);
      return response;
    },
  });
}

export function useFriendSuggestions() {
  return useQuery({
    queryKey: ['friendSuggestions'],
    queryFn: () => api.get<Friend[]>(API_CONFIG.ENDPOINTS.FRIEND_SUGGESTIONS),
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => api.post(`${API_CONFIG.ENDPOINTS.FRIEND_REQUESTS}/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendSuggestions'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] }); // Invalidate requests to show the sent request
    },
  });
}

export function useRespondToFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, accept }: { userId: number; accept: boolean }) =>
      accept
        ? api.post(API_CONFIG.ENDPOINTS.FRIENDS, { userId })
        : api.delete(`${API_CONFIG.ENDPOINTS.FRIEND_REQUESTS}/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
}
