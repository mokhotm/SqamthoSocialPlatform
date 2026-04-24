import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useFriends } from "@/hooks/use-friends";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Users, Bookmark, Clock, ShoppingBag, Camera, Star, Settings, CalendarDays, UserSquare2, Heart, Wallet } from "lucide-react";
import { SouthAfricanAccent } from "./ui/south-african-pattern";

export default function LeftSidebar() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { data: friends = [] } = useFriends();

  return (
    <aside className="hidden md:block md:w-1/4 lg:w-1/5 pr-4 sticky top-24 self-start">
      <div className="post-card relative bg-white dark:bg-gray-800 overflow-hidden">
        <SouthAfricanAccent className="absolute inset-0" color="secondary" />
        <div className="p-5 relative z-10">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src={user?.profilePicture || ''} alt={user?.displayName || user?.username || ''} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                {(user?.displayName || user?.username || '?').charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{user?.displayName || user?.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">@{user?.username}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="post-card relative bg-white dark:bg-gray-800 overflow-hidden mt-4">
        <div className="relative z-10">
          <ul className="py-1">
            <li>
              <Link 
                href="/profile" 
                className={`flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-primary/5 transition-colors duration-200 ${location === "/profile" ? "bg-primary/5 text-primary" : ""}`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="ml-3">
                  <span className="font-medium text-sm text-gray-900 dark:text-gray-100">My Profile</span>
                </div>
              </Link>
            </li>
            <li>
              <Link 
                href="/friends" 
                className={`flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-primary/5 transition-colors duration-200 ${location === "/friends" ? "bg-primary/5 text-primary" : ""}`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="ml-3 flex-1">
                  <span className="font-medium text-sm">Friends</span>
                </div>
                {friends.length > 0 && (
                  <span className="h-5 min-w-[1.25rem] bg-primary text-white text-xs rounded-full px-1.5 inline-flex items-center justify-center font-medium">
                    {friends.length}
                  </span>
                )}
              </Link>
            </li>
            <li>
              <Link 
                href="/saved-posts" 
                className={`flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-primary/5 transition-colors duration-200 ${location === "/saved-posts" ? "bg-primary/5 text-primary" : ""}`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bookmark className="h-4 w-4 text-primary" />
                </div>
                <div className="ml-3">
                  <span className="font-medium text-sm">Saved Posts</span>
                </div>
              </Link>
            </li>
            <li>
              <Link 
                href="/memories" 
                className={`flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-primary/5 transition-colors duration-200 ${location === "/memories" ? "bg-primary/5 text-primary" : ""}`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="ml-3">
                  <span className="font-medium text-sm">Memories</span>
                </div>
              </Link>
            </li>
            <li>
              <Link 
                href="/explore" 
                className={`flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-primary/5 transition-colors duration-200 ${location === "/explore" ? "bg-primary/5 text-primary" : ""}`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <div className="ml-3">
                  <span className="font-medium text-sm">Explore</span>
                </div>
              </Link>
            </li>
            <li>
              <Link 
                href="/marketplace" 
                className={`flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-primary/5 transition-colors duration-200 ${location === "/marketplace" ? "bg-primary/5 text-primary" : ""}`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                </div>
                <div className="ml-3">
                  <span className="font-medium text-sm">Marketplace</span>
                </div>
              </Link>
            </li>
            <li>
              <Link 
                href="/groups" 
                className={`flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-primary/5 transition-colors duration-200 ${location === "/groups" ? "bg-primary/5 text-primary" : ""}`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserSquare2 className="h-4 w-4 text-primary" />
                </div>
                <div className="ml-3">
                  <span className="font-medium text-sm">Groups</span>
                </div>
              </Link>
            </li>
            <li>
              <Link 
                href="/events" 
                className={`flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-primary/5 transition-colors duration-200 ${location === "/events" ? "bg-primary/5 text-primary" : ""}`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CalendarDays className="h-4 w-4 text-primary" />
                </div>
                <div className="ml-3">
                  <span className="font-medium text-sm">Events</span>
                </div>
              </Link>
            </li>
            <li>
              <Link 
                href="/health" 
                className={`flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-primary/5 transition-colors duration-200 ${location === "/health" ? "bg-primary/5 text-primary" : ""}`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-4 w-4 text-primary" />
                </div>
                <div className="ml-3">
                  <span className="font-medium text-sm">Health</span>
                </div>
              </Link>
            </li>
            <li>
              <Link 
                href="/money" 
                className={`flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-primary/5 transition-colors duration-200 ${location === "/money" ? "bg-primary/5 text-primary" : ""}`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <div className="ml-3">
                  <span className="font-medium text-sm">Money</span>
                </div>
              </Link>
            </li>
            <li>
              <Link 
                href="/settings" 
                className={`flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-primary/5 transition-colors duration-200 ${location === "/settings" ? "bg-primary/5 text-primary" : ""}`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Settings className="h-4 w-4 text-primary" />
                </div>
                <div className="ml-3">
                  <span className="font-medium text-sm">Settings</span>
                </div>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="post-card relative bg-white overflow-hidden mt-4">
        <div className="mt-4">
          <h3 className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">Your Communities</h3>
        </div>
        <div className="p-4">
          <ul className="space-y-3">
            <li>
              <Link href="/communities/tech-hub" className="group flex items-center hover:text-primary transition-colors duration-200">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white mr-3 text-xs font-medium">
                  TH
                </div>
                <div>
                  <p className="text-sm font-medium">South African Tech Hub</p>
                  <p className="text-xs text-gray-500">3.4k members</p>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/communities/foodies" className="group flex items-center hover:text-primary transition-colors duration-200">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white mr-3 text-xs font-medium">
                  JF
                </div>
                <div>
                  <p className="text-sm font-medium">Johannesburg Foodies</p>
                  <p className="text-xs text-gray-500">1.2k members</p>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/communities/photography" className="group flex items-center hover:text-primary transition-colors duration-200">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white mr-3 text-xs font-medium">
                  <Camera className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Cape Town Photography</p>
                  <p className="text-xs text-gray-500">824 members</p>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/communities" className="flex items-center text-sm font-medium text-primary mt-4 hover:underline">
                See all communities
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-4 text-center">
        <div className="sa-pattern-bg p-4 rounded-lg">
          <p className="text-sm text-gray-500">© 2025 Sqamtho</p>
          <div className="flex justify-center space-x-3 mt-2">
            <Link href="/terms" className="text-xs text-gray-500 hover:text-primary">Terms</Link>
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-primary">Privacy</Link>
            <Link href="/help" className="text-xs text-gray-500 hover:text-primary">Help</Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
