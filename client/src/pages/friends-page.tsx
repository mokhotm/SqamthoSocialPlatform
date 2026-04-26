import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import CreatePost from "@/components/create-post";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  UserPlus,
  Users,
  UserCheck,
  UserX,
  Loader2,
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
import { useToast } from "@/hooks/use-toast";
import ChatOverlay from "@/components/chat/chat-overlay";
import { useInfiniteQuery } from "@tanstack/react-query";
import PostCard from "@/components/post-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  setFriendToPostAbout,
  setIsPostDialogOpen,
}: {
  friend: Friend;
  type: "friend" | "request" | "suggestion";
  setFriendToPostAbout: (friend: Friend | null) => void;
  setIsPostDialogOpen: (isOpen: boolean) => void;
}) {
  const { mutate: sendFriendRequest } = useSendFriendRequest();
  const { mutate: respondToRequest } = useRespondToFriendRequest();
  const { toast } = useToast();

  const [isSendRelationDialogOpen, setIsSendRelationDialogOpen] = useState(false);
  const [sendRelationship, setSendRelationship] = useState<string>("Friend");

  const handleSendFriendRequest = (relationship?: string) => {
    sendFriendRequest({ userId: friend.id, relationship }, {
      onSuccess: () => {
        toast({
          title: "Friend request sent",
          description: `Friend request sent to ${friend.displayName}${relationship ? ` (${relationship})` : ''}`,
        });
        setIsSendRelationDialogOpen(false);
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

  const [isRelationDialogOpen, setIsRelationDialogOpen] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState<string>("Friend");

  const handleRespondToRequest = (accept: boolean, relationship?: string) => {
    respondToRequest(
      { friendId: friend.id, accept, relationship },
      {
        onSuccess: () => {
          toast({
            title: accept
              ? "Friend request accepted"
              : "Friend request declined",
            description: accept
              ? `You are now friends with ${friend.displayName}${relationship ? ` (${relationship})` : ''}`
              : `Declined friend request from ${friend.displayName}`,
          });
          setIsRelationDialogOpen(false);
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
          <p className="text-sm text-gray-500 dark:text-gray-400">
            @{friend.username}
          </p>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFriendToPostAbout(friend);
                setIsPostDialogOpen(true);
              }}
            >
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
            <Dialog open={isRelationDialogOpen} onOpenChange={setIsRelationDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Accept
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogTitle>Specify Relationship</DialogTitle>
                <DialogDescription>
                  Specify your relationship with {friend.displayName} to update your family tree.
                </DialogDescription>
                <div className="py-4">
                  <Select onValueChange={setSelectedRelationship} defaultValue={selectedRelationship}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Friend">Just Friend</SelectItem>
                      <SelectItem value="Father">Father</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Brother">Brother</SelectItem>
                      <SelectItem value="Sister">Sister</SelectItem>
                      <SelectItem value="Son">Son</SelectItem>
                      <SelectItem value="Daughter">Daughter</SelectItem>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Grandfather">Grandfather</SelectItem>
                      <SelectItem value="Grandmother">Grandmother</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsRelationDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleRespondToRequest(true, selectedRelationship)}
                  >
                    Confirm & Accept
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
          <Dialog open={isSendRelationDialogOpen} onOpenChange={setIsSendRelationDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-1" />
                Add Friend
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogTitle>Add Family Relative</DialogTitle>
              <DialogDescription>
                Specify your relationship with {friend.displayName} to help build your family tree.
              </DialogDescription>
              <div className="py-4">
                <Select onValueChange={setSendRelationship} defaultValue={sendRelationship}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Friend">Just Friend</SelectItem>
                    <SelectItem value="Father">Father</SelectItem>
                    <SelectItem value="Mother">Mother</SelectItem>
                    <SelectItem value="Brother">Brother</SelectItem>
                    <SelectItem value="Sister">Sister</SelectItem>
                    <SelectItem value="Son">Son</SelectItem>
                    <SelectItem value="Daughter">Daughter</SelectItem>
                    <SelectItem value="Spouse">Spouse</SelectItem>
                    <SelectItem value="Grandfather">Grandfather</SelectItem>
                    <SelectItem value="Grandmother">Grandmother</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsSendRelationDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleSendFriendRequest(sendRelationship)}
                >
                  Send Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [friendToPostAbout, setFriendToPostAbout] = useState<Friend | null>(
    null
  );

  // Fetch friends' posts
  const {
    data: friendsPostsData,
    isLoading: isLoadingFriendsPosts,
    isError: isFriendsPostsError,
    refetch: refetchFriendsPosts,
    fetchNextPage: fetchNextFriendsPosts,
    hasNextPage: hasMoreFriendsPosts,
    isFetchingNextPage: isFetchingNextFriendsPosts,
  } = useInfiniteQuery<Post[]>({
    queryKey: ["/api/posts", { filter: "friends" }],
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

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
      <div className="max-w-6xl mx-auto space-y-6 relative">
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              All Friends (
              {searchQuery ? filteredFriends.length : friends.length})
            </TabsTrigger>
            <TabsTrigger value="friends-posts" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />{" "}
              {/* Using Users icon for now, can change later */}
              Friends' Posts
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
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  type="friend"
                  setFriendToPostAbout={setFriendToPostAbout}
                  setIsPostDialogOpen={setIsPostDialogOpen}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="friends-posts" className="space-y-4">
            {isLoadingFriendsPosts ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isFriendsPostsError ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500 mb-4">
                  Failed to load friends' posts
                </p>
                <Button onClick={() => refetchFriendsPosts()} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : !friendsPostsData?.pages[0] ||
              friendsPostsData.pages[0].length === 0 ? (
              <Card className="col-span-full p-8 text-center">
                <p className="text-muted-foreground">
                  No posts from or mentioning friends yet.
                </p>
              </Card>
            ) : (
              <>
                {friendsPostsData?.pages.map((page) =>
                  page.map((post) => (
                    <PostCard
                      key={post.id}
                      id={post.id}
                      content={post.content}
                      imageUrl={post.imageUrl}
                      createdAt={post.createdAt}
                      author={post.author}
                      comments={post.comments}
                      reactions={post.reactions}
                    />
                  ))
                )}

                {hasMoreFriendsPosts && (
                  <div className="flex justify-center pb-6 pt-2">
                    <Button
                      onClick={() => fetchNextFriendsPosts()}
                      disabled={isFetchingNextFriendsPosts}
                      variant="outline"
                      className="bg-gray-100 hover:bg-gray-200 text-gray-500 px-4 py-2 rounded-full flex items-center"
                    >
                      {isFetchingNextFriendsPosts ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      )}
                      {isFetchingNextFriendsPosts
                        ? "Loading..."
                        : "Load more posts"}
                    </Button>
                  </div>
                )}
              </>
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

      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent>
          <DialogTitle className="sr-only">
            Create Post about {friendToPostAbout?.displayName}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Create a new post about your friend {friendToPostAbout?.displayName}
            .
          </DialogDescription>
          {friendToPostAbout && (
            <CreatePost
              friend={friendToPostAbout}
              onClose={() => setIsPostDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
