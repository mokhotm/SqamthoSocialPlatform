import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Bell, MessageCircle, ChevronDown, Home, Compass, Users, Calendar, Heart, Wallet } from "lucide-react";
import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SouthAfricanPattern } from "./ui/south-african-pattern";
import { SqamthoLogo, SqamthoLogoWithStyle } from "./ui/sqamtho-logo";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality would go here
    console.log("Searching for:", searchQuery);
  };

  const { theme } = useTheme();
  
  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden bg-white dark:bg-gray-900 shadow-md z-30 fixed top-0 left-0 right-0">
        <SouthAfricanPattern className="h-2" />
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <SqamthoLogoWithStyle size={30} textColor={theme === 'dark' ? '#f3f4f6' : undefined} />
            </Link>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-primary/10 hover:text-primary">
                    <ChevronDown className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href="/health" className="w-full flex items-center">
                      <Heart className="h-4 w-4 mr-2" />
                      Health
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/money" className="w-full flex items-center">
                      <Wallet className="h-4 w-4 mr-2" />
                      Money
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-primary/10 hover:text-primary">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-primary/10 hover:text-primary relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-secondary" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-md z-40">
        <SouthAfricanPattern className="h-2" />
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <SqamthoLogoWithStyle size={40} textColor={theme === 'dark' ? '#f3f4f6' : undefined} />
              </Link>
              <div className="ml-10">
                <div className="flex items-center space-x-2">
                  <Link href="/" className={`flex items-center space-x-2 px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-primary/5 transition-colors duration-200 ${location === "/" ? "bg-primary/5 text-primary" : ""}`}>
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </Link>
                  <Link href="/explore" className={`flex items-center space-x-2 px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-primary/5 transition-colors duration-200 ${location === "/explore" ? "bg-primary/5 text-primary" : ""}`}>
                    <Compass className="h-5 w-5" />
                    <span>Explore</span>
                  </Link>
                  <Link href="/groups" className={`flex items-center space-x-2 px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-primary/5 transition-colors duration-200 ${location === "/groups" ? "bg-primary/5 text-primary" : ""}`}>
                    <Users className="h-5 w-5" />
                    <span>Groups</span>
                  </Link>
                  <Link href="/events" className={`flex items-center space-x-2 px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-primary/5 transition-colors duration-200 ${location === "/events" ? "bg-primary/5 text-primary" : ""}`}>
                    <Calendar className="h-5 w-5" />
                    <span>Events</span>
                  </Link>
                  <Link href="/health" className={`flex items-center space-x-2 px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-primary/5 transition-colors duration-200 ${location === "/health" ? "bg-primary/5 text-primary" : ""}`}>
                    <Heart className="h-5 w-5" />
                    <span>Health</span>
                  </Link>
                  <Link href="/money" className={`flex items-center space-x-2 px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-primary/5 transition-colors duration-200 ${location === "/money" ? "bg-primary/5 text-primary" : ""}`}>
                    <Wallet className="h-5 w-5" />
                    <span>Money</span>
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <form onSubmit={handleSearch} className="relative">
                <input 
                  type="text" 
                  placeholder="Search Sqamtho..." 
                  className="w-64 px-4 py-2 rounded-full bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors duration-200">
                  <Search className="h-5 w-5" />
                </button>
              </form>
              <div className="relative ml-4">
                <button className="relative p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-primary/10 hover:text-primary transition-all duration-200">
                  <Bell className="h-5 w-5" />
                  {/* Notification badge with animation */}
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-secondary text-white text-xs flex items-center justify-center animate-pulse">3</span>
                </button>
              </div>
              <div className="relative ml-2">
                <Link href="/messages" className="relative p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-primary/10 hover:text-primary transition-all duration-200 block">
                  <MessageCircle className="h-5 w-5" />
                  {/* Message badge with animation */}
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-secondary text-white text-xs flex items-center justify-center animate-pulse">5</span>
                </Link>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="ml-4 flex items-center p-1.5 rounded-full hover:bg-gray-100 cursor-pointer transition-colors duration-200">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                      <AvatarImage src={user?.profilePicture || ''} alt={user?.displayName || user?.username || ''} />
                      <AvatarFallback className="bg-primary/90 text-white">
                        {user?.displayName?.charAt(0) || user?.username?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-2 mr-1">
                      <span className="text-sm font-medium block leading-tight">{user?.displayName?.split(' ')[0] || user?.username}</span>
                      <span className="text-xs text-gray-500 block leading-tight">Online</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 sa-border">
                  <DropdownMenuItem asChild className="flex items-center">
                    <Link href="/profile" className="cursor-pointer w-full">
                      <div className="font-medium">Profile</div>
                      <div className="text-xs text-gray-500">View your public profile</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="flex items-center">
                    <Link href="/settings" className="cursor-pointer w-full">
                      <div className="font-medium">Settings</div>
                      <div className="text-xs text-gray-500">Manage your preferences</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
