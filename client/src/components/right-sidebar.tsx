import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

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

interface Group {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  memberCount: number;
  messageCount: number;
}

interface Trend {
  id: number;
  name: string;
  count: string;
  category: string;
}

export default function RightSidebar() {
  const { user } = useAuth();

  const { data: conversationsData } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    enabled: !!user,
  });
  const conversations = conversationsData ?? [];

  const { data: groupsData, isLoading: isLoadingGroups } = useQuery<Group[]>({
    queryKey: ["/api/groups", { type: "suggested" }],
    enabled: !!user,
    queryFn: async () => {
      const response = await fetch("/api/groups?type=suggested");
      if (!response.ok) throw new Error("Failed to fetch suggested groups");
      return response.json();
    },
  });
  const groups = groupsData ?? [];

  const { data: trendsData } = useQuery<Trend[]>({
    queryKey: ["/api/trends"],
    enabled: !!user,
  });
  const trends = trendsData ?? [];

  return (
    <aside className="hidden lg:block lg:w-1/4 pl-4 sticky top-24 self-start">
      {/* Messages Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-4 border border-gray-100 dark:border-gray-700">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Your Messages</h2>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <Link 
                key={conversation.user.id} 
                href={`/messages/${conversation.user.id}`} 
                className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-accent/5 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0"
              >
                <div className="flex items-center">
                  <div className="relative">
                    <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-gray-800">
                      <AvatarImage src={conversation.user.profilePicture} alt={conversation.user.displayName} />
                      <AvatarFallback className="bg-gray-100 text-gray-400">
                        {conversation.user.displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{conversation.user.displayName}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2">
                        {new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{conversation.lastMessage.content}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-xs italic">
              No recent conversations
            </div>
          )}
        </div>
        <div className="p-2.5 text-center bg-gray-50/50 dark:bg-gray-800/50">
          <Link href="/messages" className="text-primary text-xs font-semibold hover:underline">View All Messages</Link>
        </div>
      </div>

      {/* Suggested Groups */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-4 border border-gray-100 dark:border-gray-700">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Suggested Groups</h2>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {isLoadingGroups ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : groups.length > 0 ? (
            groups.map((group) => (
              <div key={group.id} className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-accent/5 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/5">
                    {group.imageUrl ? (
                      <img src={group.imageUrl} alt={group.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-primary font-bold text-sm">{group.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{group.name}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">{group.memberCount} members</p>
                  </div>
                  <button className="px-3 py-1 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-full text-[11px] font-semibold transition-colors ml-2">
                    Join
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-xs italic">
              No group suggestions right now
            </div>
          )}
        </div>
        <div className="p-2.5 text-center bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-50 dark:border-gray-700">
          <Link href="/groups" className="text-primary text-xs font-semibold hover:underline">Discover Groups</Link>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Trending in South Africa</h2>
        </div>
        <div>
          {trends.length > 0 ? (
            trends.map((trend) => (
              <Link key={trend.id} href={`/trend/${trend.name.toLowerCase().replace('#', '')}`} className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-accent/5 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0">
                <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{trend.category}</p>
                <p className="font-bold text-sm text-gray-900 dark:text-gray-100 mt-0.5">{trend.name}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{trend.count}</p>
              </Link>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-xs italic">
              Nothing trending yet
            </div>
          )}
        </div>
        <div className="p-2.5 text-center bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-50 dark:border-gray-700">
          <button className="text-primary text-xs font-semibold hover:underline">Show more</button>
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
