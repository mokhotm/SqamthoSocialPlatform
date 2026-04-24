import { useConversations } from '@/hooks/use-conversations';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

export function ConversationList() {
  const { data: conversations, isLoading } = useConversations();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!conversations?.length) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No conversations yet</p>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-4 pr-4">
        {conversations.map((conversation) => {
          const lastMessage = conversation.messages[conversation.messages.length - 1];
          const otherParticipants = conversation.participants.filter(
            (p) => p.id !== conversation.author?.id
          );

          return (
            <Link key={conversation.id} to={`/conversations/${conversation.id}`}>
              <Card className="p-4 hover:bg-accent transition-colors">
                <div className="flex items-center space-x-4">
                  {otherParticipants.length === 1 ? (
                    <Avatar>
                      <AvatarImage src={otherParticipants[0].profilePicture} />
                      <AvatarFallback>
                        {otherParticipants[0].displayName[0]}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar>
                      <AvatarFallback>
                        {otherParticipants.length}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">
                      {otherParticipants
                        .map((p) => p.displayName)
                        .join(', ')}
                    </p>
                    {lastMessage && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {lastMessage.author?.displayName}: {lastMessage.content}
                      </p>
                    )}
                  </div>
                  {lastMessage && (
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(lastMessage.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </ScrollArea>
  );
}
