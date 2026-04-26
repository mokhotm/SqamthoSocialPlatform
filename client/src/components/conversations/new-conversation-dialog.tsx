import { useState } from 'react';
import { useFriends } from '@/hooks/use-friends';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Search, MessageSquarePlus, Loader2, Plus } from 'lucide-react';

interface Friend {
  id: number;
  username: string;
  displayName: string;
  profilePicture?: string;
  status: string;
}

interface NewConversationDialogProps {
  onConversationCreated?: (userId: number) => void;
  trigger?: React.ReactNode;
}

export function NewConversationDialog({ onConversationCreated, trigger }: NewConversationDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: friendsData, isLoading: friendsLoading } = useFriends();
  const friends = (friendsData ?? []) as Friend[];

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (participantId: number) => {
      const res = await apiRequest('POST', '/api/conversations', { participantId });
      return await res.json();
    },
    onSuccess: (data, participantId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      setOpen(false);
      setSearchQuery('');
      if (onConversationCreated) {
        onConversationCreated(participantId);
      }
    },
  });

  // Filter friends by search query
  const filteredFriends = friends.filter((friend) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      friend.displayName?.toLowerCase().includes(query) ||
      friend.username?.toLowerCase().includes(query)
    );
  });

  const handleSelectFriend = (friend: Friend) => {
    createConversationMutation.mutate(friend.id);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            New Conversation
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5 text-primary" />
            New Conversation
          </DialogTitle>
          <DialogDescription>
            Select a friend to start a conversation with.
          </DialogDescription>
        </DialogHeader>

        {/* Search input */}
        <div className="relative mt-2">
          <Input
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        {/* Friends list */}
        <div className="max-h-[300px] overflow-y-auto mt-2 space-y-1">
          {friendsLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery
                ? 'No friends match your search'
                : friends.length === 0
                ? 'You have no friends yet. Add some friends first!'
                : 'No results found'}
            </div>
          ) : (
            filteredFriends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => handleSelectFriend(friend)}
                disabled={createConversationMutation.isPending}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left disabled:opacity-50"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={friend.profilePicture} alt={friend.displayName} />
                  <AvatarFallback className="bg-primary text-white">
                    {(friend.displayName || friend.username || '?').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{friend.displayName || friend.username}</p>
                  <p className="text-sm text-gray-500 truncate">@{friend.username}</p>
                </div>
                {createConversationMutation.isPending &&
                  createConversationMutation.variables === friend.id && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
              </button>
            ))
          )}
        </div>

        {createConversationMutation.isError && (
          <p className="text-sm text-red-500 mt-2">
            Failed to create conversation. Please try again.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
