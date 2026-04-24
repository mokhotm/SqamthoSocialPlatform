import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  UserPlus,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useFriends,
  useFriendRequests,
  useFriendSuggestions,
  useSendFriendRequest,
  useRespondToFriendRequest,
} from "@/hooks/use-friends";
import { useToast } from "@/components/ui/use-toast";

interface Friend {
  id: number;
  username: string;
  displayName: string;
  profilePicture?: string;
  mutualFriends?: number;
  isOnline?: boolean;
}

function FriendCard({
  friend,
  type,
}: {
  friend: Friend;
  type: "friend" | "request" | "suggestion";
}) {
  const { mutate: sendFriendRequest } = useSendFriendRequest();
  const { mutate: respondToRequest } = useRespondToFriendRequest();
  const { toast } = useToast();

  const handleSendFriendRequest = () => {
    sendFriendRequest(friend.id, {
      onSuccess: () => {
        toast({
          title: "Friend request sent",
          description: `Friend request sent to ${friend.displayName}`,
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to send friend request",
          variant: "destructive",
        });
      },
    });
  };

  const handleRespondToRequest = (accept: boolean) => {
    respondToRequest(
      { userId: friend.id, accept },
      {
        onSuccess: () => {
          toast({
            title: accept
              ? "Friend request accepted"
              : "Friend request declined",
            description: accept
              ? `You are now friends with ${friend.displayName}`
              : `Declined friend request from ${friend.displayName}`,
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: `Failed to ${
              accept ? "accept" : "decline"
            } friend request`,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Card className="p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src={friend.profilePicture} alt={friend.displayName} />
          <AvatarFallback>{friend.displayName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{friend.displayName}</h3>
          <p className="text-sm text-gray-500">@{friend.username}</p>
          {friend.mutualFriends && (
            <p className="text-xs text-gray-500 mt-1">
              {friend.mutualFriends} mutual friends
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {type === "friend" && (
          <>
            <Button variant="outline" size="sm">
              Message
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => handleRespondToRequest(false)}
            >
              <UserX className="h-4 w-4" />
            </Button>
          </>
        )}
        {type === "request" && (
          <>
            <Button
              size="sm"
              className="bg-primary text-white hover:bg-primary/90"
              onClick={() => handleRespondToRequest(true)}
            >
              <UserCheck className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => handleRespondToRequest(false)}
            >
              Decline
            </Button>
          </>
        )}
        {type === "suggestion" && (
          <Button size="sm" onClick={handleSendFriendRequest}>
            <UserPlus className="h-4 w-4 mr-1" />
            Add Friend
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function FriendsPage() {
  const { user } = useAuth();
  const { data: friends = [], isLoading: isLoadingFriends } = useFriends();
  const { data: friendRequests = [], isLoading: isLoadingRequests } =
    useFriendRequests();
  const { data: suggestions = [], isLoading: isLoadingSuggestions } =
    useFriendSuggestions();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFriends = Array.isArray(friends)
    ? friends.filter(
        (friend) =>
          friend.displayName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          friend.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredRequests = Array.isArray(friendRequests)
    ? friendRequests.filter(
        (friend) =>
          friend.displayName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          friend.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredSuggestions = Array.isArray(suggestions)
    ? suggestions.filter(
        (friend) =>
          friend.displayName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          friend.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Friends
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {user ? `Welcome, ${user.displayName}` : "Loading..."} • Manage
              your connections
            </p>
          </div>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Find Friends
          </Button>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search friends..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </Card>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              All Friends (
              {searchQuery ? filteredFriends.length : friends.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center">
              <UserPlus className="h-4 w-4 mr-2" />
              Requests (
              {searchQuery ? filteredRequests.length : friendRequests.length})
              {friendRequests.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center h-5 w-5 text-xs font-semibold rounded-full bg-primary text-white">
                  {friendRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center">
              <UserCheck className="h-4 w-4 mr-2" />
              Suggestions (
              {searchQuery ? filteredSuggestions.length : suggestions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoadingFriends ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="p-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredFriends.length === 0 ? (
              <Card className="col-span-full p-6 text-center">
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No friends match your search"
                    : "No friends yet"}
                </p>
              </Card>
            ) : (
              filteredFriends.map((friend) => (
                <FriendCard key={friend.id} friend={friend} type="friend" />
              ))
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            {isLoadingRequests ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="p-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredRequests.length === 0 ? (
              <Card className="col-span-full p-6 text-center">
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No requests match your search"
                    : "No friend requests"}
                </p>
              </Card>
            ) : (
              filteredRequests.map((friend) => (
                <FriendCard key={friend.id} friend={friend} type="request" />
              ))
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            {isLoadingSuggestions ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="p-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredSuggestions.length === 0 ? (
              <Card className="col-span-full p-6 text-center">
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No suggestions match your search"
                    : "No friend suggestions"}
                </p>
              </Card>
            ) : (
              filteredSuggestions.map((friend) => (
                <FriendCard key={friend.id} friend={friend} type="suggestion" />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
