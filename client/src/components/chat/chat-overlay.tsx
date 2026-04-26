import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X, Search, Plus, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Conversation from "./conversation";

interface User {
  id: number;
  username: string;
  displayName: string;
  profilePicture: string;
}

interface Conversation {
  user: User;
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

export default function ChatOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<User | null>(null);
  const { user } = useAuth();
  
  const { data: conversationsData } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    enabled: !!user,
  });
  const conversations = conversationsData ?? [];
  
  // Filter conversations based on search query
  const filteredConversations = conversations.filter(
    (conversation) => 
      conversation.user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Close conversation when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const overlay = document.getElementById('mobile-message-overlay');
      const conversation = document.getElementById('chat-conversation');
      
      if (
        overlay && 
        !overlay.contains(event.target as Node) && 
        conversation && 
        !conversation.contains(event.target as Node) &&
        event.target !== document.getElementById('open-message-overlay')
      ) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <>
      {/* Mobile Messaging Overlay */}
      <div 
        id="mobile-message-overlay" 
        className={`fixed inset-0 bg-white z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'} md:hidden`}
      >
        <div className="flex flex-col h-full">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <button onClick={() => setIsOpen(false)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-medium">Conversations</h2>
            <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search conversations..." 
                className="w-full px-4 py-2 pl-10 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.user.id}
                  className="block w-full px-4 py-3 hover:bg-gray-50 transition border-b border-gray-200 text-left"
                  onClick={() => setSelectedConversation(conversation.user)}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.user.profilePicture} alt={conversation.user.displayName} />
                        <AvatarFallback className="bg-gray-300">
                          {conversation.user.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white"></div>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{conversation.user.displayName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{conversation.lastMessage.content}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                {searchQuery 
                  ? "No conversations found matching your search" 
                  : "No conversations yet. Start by adding friends!"}
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-200 flex justify-center">
            <Button className="bg-primary text-white rounded-full px-4 py-2 flex items-center shadow-sm">
              <Plus className="h-5 w-5 mr-2" />
              New Message
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Action Button (Mobile) */}
      <div className="fixed right-4 bottom-20 md:hidden z-30">
        <button 
          id="open-message-overlay" 
          className="h-14 w-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center"
          onClick={() => setIsOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* Chat Conversation Modal */}
      {selectedConversation && (
        <Conversation 
          user={selectedConversation}
          onClose={() => setSelectedConversation(null)}
        />
      )}
    </>
  );
}
