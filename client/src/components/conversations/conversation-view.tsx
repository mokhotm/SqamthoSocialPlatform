import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useConversation, useConversationMessages, useSendMessage } from '@/hooks/use-conversations';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/use-auth';

interface MessageFormData {
  content: string;
}

export function ConversationView() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const { data: conversation, isLoading: isLoadingConversation } = useConversation(
    Number(conversationId)
  );
  const { data: messages, isLoading: isLoadingMessages } = useConversationMessages(
    Number(conversationId)
  );
  const { mutate: sendMessage } = useSendMessage();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, reset } = useForm<MessageFormData>();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const onSubmit = handleSubmit((data) => {
    if (!conversationId) return;
    sendMessage(
      {
        conversationId: Number(conversationId),
        content: data.content,
      },
      {
        onSuccess: () => {
          reset();
        },
      }
    );
  });

  if (isLoadingConversation || isLoadingMessages) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!conversation || !messages) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Conversation not found</p>
      </Card>
    );
  }

  const otherParticipants = conversation.participants.filter(
    (p) => p.id !== user?.id
  );

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <Card className="p-4">
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
              <AvatarFallback>{otherParticipants.length}</AvatarFallback>
            </Avatar>
          )}
          <div>
            <h2 className="text-lg font-semibold">
              {otherParticipants.map((p) => p.displayName).join(', ')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {otherParticipants.length} participants
            </p>
          </div>
        </div>
      </Card>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwnMessage = message.author?.id === user?.id;

            return (
              <div
                key={message.id}
                className={`flex items-start space-x-4 ${
                  isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <Avatar>
                  <AvatarImage src={message.author?.profilePicture} />
                  <AvatarFallback>
                    {message.author?.displayName[0]}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`space-y-1 ${
                    isOwnMessage ? 'items-end text-right' : ''
                  }`}
                >
                  <p className="text-sm font-medium">
                    {message.author?.displayName}
                  </p>
                  <div
                    className={`rounded-lg p-3 ${
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(message.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <Card className="p-4 mt-4">
        <form onSubmit={onSubmit} className="flex space-x-4">
          <Input
            {...register('content', { required: true })}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit">Send</Button>
        </form>
      </Card>
    </div>
  );
}
