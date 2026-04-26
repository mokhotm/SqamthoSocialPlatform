import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import { useAuth } from '@/hooks/use-auth';

interface Friend {
  id: number;
  username: string;
  displayName: string;
  profilePicture?: string;
  mutualFriends?: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export function useFriends(options: { includePending?: boolean } = {}) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['friends', options.includePending],
    enabled: !!user,
    queryFn: () => {
      const url = options.includePending 
        ? `${API_CONFIG.ENDPOINTS.FRIENDS}?includePending=true` 
        : API_CONFIG.ENDPOINTS.FRIENDS;
      return api.get<Friend[]>(url);
    },
  });
}

export function useFriendRequests() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['friendRequests'],
    enabled: !!user,
    queryFn: async () => {
      const response = await api.get<Friend[]>(API_CONFIG.ENDPOINTS.FRIEND_REQUESTS);
      console.log('Friend requests response:', response);
      return response;
    },
  });
}

export function useFriendSuggestions() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['friendSuggestions'],
    enabled: !!user,
    queryFn: () => api.get<Friend[]>(API_CONFIG.ENDPOINTS.FRIEND_SUGGESTIONS),
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, relationship }: { userId: number; relationship?: string }) => 
      api.post(`/api/friends/friend-requests/${userId}`, { relationship }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendSuggestions'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] }); // Invalidate requests to show the sent request
    },
  });
}

export function useRespondToFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ friendId, accept, relationship }: { friendId: number; accept: boolean; relationship?: string }) =>
      accept
        ? api.post(`/api/friends/friend-request/${friendId}/accept`, { relationship })
        : api.delete(`/api/friends/friend-request/${friendId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error) => {
      console.error('Error responding to friend request:', error); // Add error logging
    },
  });
}
