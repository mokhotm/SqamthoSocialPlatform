import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateConversation } from '@/hooks/use-conversations';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface User {
  id: number;
  username: string;
  displayName: string;
  profilePicture?: string;
}

export function NewConversationDialog() {
  const [open, setOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const { mutate: createConversation } = useCreateConversation();

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get<User[]>('/users'),
  });

  const handleSelectUser = (user: User) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleRemoveUser = (userId: number) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const handleCreateConversation = () => {
    if (selectedUsers.length === 0) return;

    createConversation(selectedUsers.map((u) => u.id), {
      onSuccess: (conversation) => {
        setOpen(false);
        navigate(`/conversations/${conversation.id}`);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Conversation</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Select users to start a conversation with.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <Badge
                key={user.id}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.profilePicture} />
                  <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                </Avatar>
                {user.displayName}
                <button
                  onClick={() => handleRemoveUser(user.id)}
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
          <Command className="rounded-lg border shadow-md">
            <CommandInput placeholder="Search users..." />
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              {users?.map((user) => (
                <CommandItem
                  key={user.id}
                  onSelect={() => handleSelectUser(user)}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{user.displayName}</p>
                    <p className="text-sm text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreateConversation}
            disabled={selectedUsers.length === 0}
          >
            Create Conversation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
