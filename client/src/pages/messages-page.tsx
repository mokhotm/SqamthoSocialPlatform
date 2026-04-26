import { useState, useEffect, useRef } from "react";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Phone, VideoIcon, Info, Plus, Paperclip, Smile, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { addMessageListener, sendWebSocketMessage } from "@/lib/websocket";
import { format } from "date-fns";
import { NewConversationDialog } from "@/components/conversations/new-conversation-dialog";

interface Conversation {
  user: {
    id: number;
    username: string;
    displayName: string;
    profilePicture: string;
  };
  lastMessage: {
    id: number;
    content: string;
    senderId: number;
    receiverId: number;
    read: boolean;
    createdAt: string;
  };
  isOnline: boolean;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  read: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get all conversations
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    enabled: !!currentUser,
  });
  const conversations = conversationsData ?? [];

  // Get messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["messages", selectedUser],
    enabled: !!selectedUser,
  });

  // Filter conversations by search query
  const filteredConversations = conversations.filter(conversation => 
    conversation.user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find selected conversation
  const selectedConversation = conversations.find(conv => conv.user.id === selectedUser);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedUser) throw new Error("No user selected");
      
      const res = await apiRequest("POST", "/api/messages", {
        receiverId: selectedUser,
        content
      });
      return await res.json();
    },
    onSuccess: (message) => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUser] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      
      // Also send via WebSocket for real-time delivery
      sendWebSocketMessage({
        type: 'chat_message',
        message: {
          senderId: currentUser?.id,
          receiverId: selectedUser,
          content: message.content
        }
      });
    }
  });

  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedUser) {
      sendMessageMutation.mutate(newMessage);
    }
  };

  // Listen for new messages from WebSocket
  useEffect(() => {
    const removeListener = addMessageListener((data) => {
      if (data.type === 'new_message') {
        // If message is from or to the selected user, refresh messages
        const message = data.message;
        if (
          selectedUser && 
          ((message.senderId === selectedUser && message.receiverId === currentUser?.id) ||
           (message.senderId === currentUser?.id && message.receiverId === selectedUser))
        ) {
          queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUser] });
        }
        
        // Always refresh conversations list to update latest message
        queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      }
    });
    
    return () => removeListener();
  }, [selectedUser, currentUser?.id, queryClient]);

  // Scroll to bottom of messages when they change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Format date for messages
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return format(date, "h:mm a");
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return format(date, "MMM d");
    }
  };

  return (
    <>
    <Layout showRightSidebar={false}>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[calc(100vh-9rem)]">
          <div className="flex h-full">
            {/* Left sidebar with conversations */}
            <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h1 className="text-lg font-semibold">Messages</h1>
                <div className="mt-2 relative">
                  <Input 
                    placeholder="Search conversations..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {conversationsLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchQuery ? "No conversations match your search" : "No conversations yet"}
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <button
                      key={conversation.user.id}
                      onClick={() => setSelectedUser(conversation.user.id)}
                      className={`w-full p-3 flex items-start hover:bg-gray-50 transition border-b border-gray-100 text-left ${
                        selectedUser === conversation.user.id ? 'bg-gray-50' : ''
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={conversation.user.profilePicture} alt={conversation.user.displayName} />
                          <AvatarFallback className="bg-primary text-white">
                            {conversation.user.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.isOnline && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                        )}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-medium truncate">{conversation.user.displayName}</h3>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatMessageDate(conversation.lastMessage.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage.senderId === currentUser?.id ? (
                            <span className="text-gray-400">You: </span>
                          ) : null}
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                      {!conversation.lastMessage.read && 
                       conversation.lastMessage.receiverId === currentUser?.id && (
                        <span className="h-2.5 w-2.5 bg-primary rounded-full flex-shrink-0 mt-2"></span>
                      )}
                    </button>
                  ))
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <NewConversationDialog
                  onConversationCreated={(userId) => setSelectedUser(userId)}
                  trigger={
                    <Button variant="outline" className="w-full flex items-center justify-center">
                      <Plus className="h-4 w-4 mr-2" />
                      New Conversation
                    </Button>
                  }
                />
              </div>
            </div>
            
            {/* Right side - conversation */}
            <div className="hidden md:flex md:w-2/3 flex-col">
              {selectedUser && selectedConversation ? (
                <>
                  {/* Conversation header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedConversation.user.profilePicture} alt={selectedConversation.user.displayName} />
                        <AvatarFallback className="bg-primary text-white">
                          {selectedConversation.user.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <h2 className="font-medium">{selectedConversation.user.displayName}</h2>
                        <p className="text-xs text-gray-500 flex items-center">
                          {selectedConversation.isOnline ? (
                            <>
                              <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                              Online
                            </>
                          ) : (
                            'Offline'
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon">
                        <Phone className="h-5 w-5 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <VideoIcon className="h-5 w-5 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Info className="h-5 w-5 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                    {messagesLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="bg-primary/10 p-4 rounded-full mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-800">No messages yet</h3>
                        <p className="text-gray-500 mt-2">Start a conversation with {selectedConversation.user.displayName}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message, index) => {
                          const isSentByCurrentUser = message.senderId === currentUser?.id;
                          const showDateHeader = index === 0 || new Date(message.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();
                          
                          return (
                            <div key={message.id}>
                              {showDateHeader && (
                                <div className="flex justify-center my-4">
                                  <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                                    {new Date(message.createdAt).toLocaleDateString(undefined, { 
                                      weekday: 'long', 
                                      month: 'short', 
                                      day: 'numeric',
                                      year: new Date(message.createdAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                                    })}
                                  </span>
                                </div>
                              )}
                              <div className={`flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                {!isSentByCurrentUser && (
                                  <Avatar className="h-8 w-8 mr-2 flex-shrink-0 self-end mb-1">
                                    <AvatarImage src={selectedConversation.user.profilePicture} alt={selectedConversation.user.displayName} />
                                    <AvatarFallback className="bg-primary text-white">
                                      {selectedConversation.user.displayName.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                <div className={`max-w-md ${isSentByCurrentUser ? 'chat-bubble-sent bg-primary/10 text-gray-800' : 'chat-bubble-received bg-white text-gray-800'} px-4 py-2 rounded-lg shadow-sm`}>
                                  <p>{message.content}</p>
                                  <p className={`text-xs ${isSentByCurrentUser ? 'text-gray-500' : 'text-gray-500'} mt-1 text-right`}>
                                    {format(new Date(message.createdAt), 'h:mm a')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                  
                  {/* Message input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex items-center">
                    <Button type="button" variant="ghost" size="icon" className="text-gray-500">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Input 
                      placeholder="Type a message..." 
                      className="mx-3" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button type="button" variant="ghost" size="icon" className="text-gray-500">
                      <Smile className="h-5 w-5" />
                    </Button>
                    <Button 
                      type="submit" 
                      className="ml-2 bg-primary text-white"
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    >
                      {sendMessageMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-medium text-gray-800 mb-2">Your Messages</h2>
                  <p className="text-gray-500 max-w-md">
                    Select a conversation from the sidebar or start a new one to begin messaging.
                  </p>
                  <NewConversationDialog
                    onConversationCreated={(userId) => setSelectedUser(userId)}
                    trigger={
                      <Button className="mt-6">
                        <Plus className="h-4 w-4 mr-2" />
                        New Conversation
                      </Button>
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
    </Layout>
    </>
  );
}
