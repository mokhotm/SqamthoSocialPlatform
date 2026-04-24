import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";

interface Conversation {
  user: {
    id: number;
    username: string;
    displayName: string;
    profilePicture: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
  };
  isOnline: boolean;
}

export default function RightSidebar() {
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    // No need to specify the queryFn since it's set globally
  });

  return (
    <aside className="hidden lg:block lg:w-1/4 pl-4 sticky top-24 self-start">
      {/* Messages Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-4">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-medium text-gray-900 dark:text-white">Your Messages</h2>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <Link 
                key={conversation.user.id} 
                href={`/messages/${conversation.user.id}`} 
                className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition border-b border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
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
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{conversation.user.displayName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{conversation.lastMessage.content}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
              No messages yet. Start a conversation!
            </div>
          )}
        </div>
        <div className="p-3 text-center">
          <Link href="/messages" className="text-primary text-sm font-medium">See all in Messages</Link>
        </div>
      </div>

      {/* Suggested Groups */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-4">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-medium text-gray-900 dark:text-white">Suggested Groups</h2>
        </div>
        <div>
          <div className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gray-300 dark:bg-gray-700 overflow-hidden">
                <img 
                  src="https://via.placeholder.com/100/4CAF50/FFFFFF?text=DF" 
                  alt="Durban Foodies" 
                  className="h-full w-full object-cover" 
                />
              </div>
              <div className="ml-3 flex-1">
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100">Durban Foodies</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">15.2K members • 25 posts a day</p>
              </div>
              <button className="px-3 py-1 bg-primary text-white rounded-full text-xs font-medium">Join</button>
            </div>
          </div>
          <div className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gray-300 dark:bg-gray-700 overflow-hidden">
                <img 
                  src="https://via.placeholder.com/100/4CAF50/FFFFFF?text=SAT" 
                  alt="South African Travelers" 
                  className="h-full w-full object-cover" 
                />
              </div>
              <div className="ml-3 flex-1">
                <p className="font-medium text-sm">South African Travelers</p>
                <p className="text-xs text-gray-500">8.7K members • 12 posts a day</p>
              </div>
              <button className="px-3 py-1 bg-primary text-white rounded-full text-xs font-medium">Join</button>
            </div>
          </div>
          <div className="block px-4 py-3 hover:bg-gray-50 transition">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gray-300 overflow-hidden">
                <img 
                  src="https://via.placeholder.com/100/4CAF50/FFFFFF?text=SAS" 
                  alt="SA Startup Network" 
                  className="h-full w-full object-cover" 
                />
              </div>
              <div className="ml-3 flex-1">
                <p className="font-medium text-sm">SA Startup Network</p>
                <p className="text-xs text-gray-500">5.3K members • 8 posts a day</p>
              </div>
              <button className="px-3 py-1 bg-primary text-white rounded-full text-xs font-medium">Join</button>
            </div>
          </div>
        </div>
        <div className="p-3 text-center">
          <Link href="/groups/discover" className="text-primary text-sm font-medium">Discover more groups</Link>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-medium text-gray-900 dark:text-white">Trending in South Africa</h2>
        </div>
        <div>
          <Link href="/trend/protea-fire" className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition border-b border-gray-200 dark:border-gray-700">
            <p className="font-medium text-sm text-gray-900 dark:text-gray-100">#Cricket</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">15.5K posts</p>
          </Link>
          <Link href="/trend/mzansi-vibes" className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition border-b border-gray-200 dark:border-gray-700">
            <p className="font-medium text-sm text-gray-900 dark:text-gray-100">#MzansiVibes</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Entertainment • 9.2K posts</p>
          </Link>
          <Link href="/trend/heritage-day" className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
            <p className="font-medium text-sm text-gray-900 dark:text-gray-100">#HeritageDay2023</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Culture • 5.7K posts</p>
            <p className="text-sm font-medium">#HeritageDay2023</p>
            <p className="text-xs text-gray-500">Culture • 5.7K posts</p>
          </Link>
        </div>
        <div className="p-3 text-center border-t border-gray-200">
          <Link href="/trends" className="text-primary text-sm font-medium">Show more</Link>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <div className="flex flex-wrap">
          <Link href="/about" className="mr-2 mb-1 hover:underline">About</Link>
          <Link href="/privacy" className="mr-2 mb-1 hover:underline">Privacy</Link>
          <Link href="/terms" className="mr-2 mb-1 hover:underline">Terms</Link>
          <Link href="/advertising" className="mr-2 mb-1 hover:underline">Advertising</Link>
          <Link href="/cookies" className="mr-2 mb-1 hover:underline">Cookies</Link>
          <Link href="/help" className="mr-2 mb-1 hover:underline">Help</Link>
        </div>
        <p className="mt-2">© {new Date().getFullYear()} Sqamtho</p>
      </div>
    </aside>
  );
}
