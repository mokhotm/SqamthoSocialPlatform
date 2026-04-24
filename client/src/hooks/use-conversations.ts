import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Conversation {
  id: number;
  createdAt: Date;
  messages: Message[];
  participants: Participant[];
}

interface Message {
  id: number;
  conversationId: number;
  content: string;
  timestamp: Date;
  author: {
    id: number;
    username: string;
    displayName: string;
    profilePicture?: string;
  } | null;
}

interface Participant {
  id: number;
  username: string;
  displayName: string;
  profilePicture?: string;
}

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get<Conversation[]>('/conversations'),
  });
}

export function useConversation(conversationId: number) {
  return useQuery({
    queryKey: ['conversations', conversationId],
    queryFn: () => api.get<Conversation>(`/conversations/${conversationId}`),
    enabled: !!conversationId,
  });
}

export function useConversationMessages(conversationId: number) {
  return useQuery({
    queryKey: ['conversations', conversationId, 'messages'],
    queryFn: () => api.get<Message[]>(`/conversations/${conversationId}/messages`),
    enabled: !!conversationId,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (participantIds: number[]) =>
      api.post<Conversation>('/conversations', { participantIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      content,
    }: {
      conversationId: number;
      content: string;
    }) =>
      api.post<Message>(`/conversations/${conversationId}/messages`, { content }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['conversations', variables.conversationId, 'messages'],
      });
    },
  });
}
