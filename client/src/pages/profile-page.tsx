import { useState } from "react";
import CreatePost from "@/components/create-post";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { API_CONFIG } from "@/lib/config";
import { api } from "@/lib/api";
import { SouthAfricanPattern } from "@/components/ui/south-african-pattern";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Users, Edit, Camera, User, Globe, Cake, Plus } from "lucide-react";
import PostCard from "@/components/post-card";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import FamilyTree from "@/components/family-tree";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProfileEditForm } from "@/components/profile-edit-form";
import { FamilyMemberDialog } from "@/components/family-member-dialog";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
    displayName: string;
    profilePicture: string;
  };
  comments: {
    id: number;
    content: string;
    createdAt: string;
    author: {
      id: number;
      username: string;
      displayName: string;
      profilePicture: string;
    };
  }[];
  reactions: {
    count: number;
    types: Record<string, number>;
  };
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  const [showCreatePostForm, setShowCreatePostForm] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFamilyDialogOpen, setIsFamilyDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const handleProfileUpdateSuccess = () => {
    setIsEditDialogOpen(false);
    // Invalidate the profile query to refetch the updated data
    queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
  };

  const updateFamilyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.put("/api/friends/relationship", {
        ...data,
        friendId: parseInt(data.friendId)
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Family member updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["family-tree", user?.id] });
      setIsFamilyDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update family member",
        variant: "destructive",
      });
    }
  });

  // Fetch family tree data
  const { data: familyData, isLoading: familyDataLoading } = useQuery<any>({
    queryKey: ["family-tree", user?.id],
    queryFn: async () => {
      const res = await fetch(API_CONFIG.getFullUrl(`/api/friends/family-tree/${user?.id}`), {
        credentials: 'include',
      });
      if (!res.ok) throw new Error("Failed to fetch family tree");
      return res.json();
    },
    enabled: !!user?.id,
  });
  
  // Fetch user profile data (includes posts and friends)
  const { data: profileData, isLoading: profileLoading } = useQuery<{
    user: typeof user & { bio?: string; location?: string; coverImage?: string; createdAt: string };
    posts: Post[];
    friends: any[];
  }>({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      try {
        if (!user?.id) throw new Error("User not authenticated");
        
        console.log(`[Profile] Fetching profile for user ID: ${user.id}, username: ${user.username}`);
        const res = await fetch(API_CONFIG.getFullUrl(`/api/profile/${user.id}`), {
          credentials: 'include',
        });
        if (!res.ok) {
          const error = await res.text();
          console.error('Profile API fetch error:', res.status, error);
          throw new Error(`API error: ${res.status} ${error}`);
        }
        const data = await res.json();
        console.log('[Profile] API fetch success - User:', data.user?.username, 'Posts count:', data.posts?.length);
        data.posts?.forEach((post: any, i: number) => {
          console.log(`[Profile] Post ${i}: author=${post.author?.username}, userId=${post.author?.id}`);
        });
        return data;
      } catch (error) {
        console.error('Error during profile fetch:', error);
        throw error;
      }
    },
    enabled: !!user?.id, // Only run query when user is available
  });
  
  const posts = profileData?.posts || [];
  const friends = profileData?.friends || [];
  
  // Helper to extract all user IDs currently in the family tree to avoid duplicates
  const getLinkedFamilyIds = (node: any, ids: Set<number> = new Set()): Set<number> => {
    if (!node) return ids;
    if (node.id) ids.add(node.id);
    if (node.spouse) ids.add(node.spouse.id);
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child: any) => getLinkedFamilyIds(child, ids));
    }
    return ids;
  };

  const linkedFamilyIds = familyData ? getLinkedFamilyIds(familyData) : new Set<number>();
  const unlinkedFriends = friends.filter(friend => !linkedFamilyIds.has(friend.id));

  const postsLoading = profileLoading;
  const friendsLoading = profileLoading;
  const enhancedUser = profileData?.user || user;
  
  if (!user) return null;

  const userJoinDate = enhancedUser?.createdAt
    ? format(new Date(enhancedUser.createdAt), "MMMM yyyy")
    : enhancedUser.id 
      ? format(new Date(2023, 0, enhancedUser.id % 12, 0, 0, 0), "MMMM yyyy") 
      : "January 2023";

  return (
    <Layout>
          {/* Profile Header */}
          <div className="max-w-6xl mx-auto bg-background">
            {/* Cover Image */}
            <div className="relative h-64 bg-gray-200 overflow-hidden rounded-lg">
              {enhancedUser.coverImage ? (
                <img
                  src={enhancedUser.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <SouthAfricanPattern className="w-full h-full opacity-50" />
              )}
              <Button 
                className="absolute bottom-4 right-4 bg-background/80 hover:bg-background text-foreground border border-border shadow-md"
                variant="secondary"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Camera className="h-4 w-4 mr-2" />
                Update Cover
              </Button>
            </div>
            
            {/* Profile Info */}
            <div className="px-4 md:px-6 pb-6 relative">
              <div className="flex flex-col md:flex-row md:items-end">
                <div className="flex-shrink-0 -mt-16 z-10">
                  <Avatar className="h-32 w-32 rounded-md border-4 border-white shadow-md">
                    <AvatarImage src={enhancedUser.profilePicture || '/uploads/default-avatar.png'} alt={enhancedUser.displayName || enhancedUser.username}  />
                    <AvatarFallback className="text-3xl bg-primary text-white rounded-md">
                      {enhancedUser.displayName ? enhancedUser.displayName.charAt(0) : enhancedUser.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="mt-4 md:mt-0 md:ml-4 flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold dark:text-white">{enhancedUser.displayName || enhancedUser.username}</h1>
                      <p className="text-gray-500 dark:text-gray-400">@{enhancedUser.username}</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <Button 
                        type="button"
                        className="flex items-center"
                        onClick={() => setIsEditDialogOpen(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bio & Details */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2">
                  {enhancedUser.bio ? (
                    <p>{enhancedUser.bio}</p>
                  ) : (
                    <p className="text-gray-500 italic">No bio yet. Tell people about yourself.</p>
                  )}
                </div>
                <div className="space-y-2">
                  {enhancedUser.location && (
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{enhancedUser.location}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Joined {userJoinDate}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{friends.length} Friends</span>
                  </div>
                  {(enhancedUser as any).gender && (
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-2" />
                      <span>{(enhancedUser as any).gender}</span>
                    </div>
                  )}
                  {(enhancedUser as any).ethnicity && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Globe className="h-4 w-4 mr-2" />
                      <span>{(enhancedUser as any).ethnicity}</span>
                    </div>
                  )}
                  {(enhancedUser as any).dateOfBirth && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Cake className="h-4 w-4 mr-2" />
                      <span>
                        {(() => {
                          const birth = new Date((enhancedUser as any).dateOfBirth);
                          const age = new Date().getFullYear() - birth.getFullYear();
                          const m = new Date().getMonth() - birth.getMonth();
                          if (m < 0 || (m === 0 && new Date().getDate() < birth.getDate())) {
                            return age - 1;
                          }
                          return age;
                        })()} years old
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Profile Tabs */}
            <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-t border-gray-200">
                <TabsList className="flex w-full bg-transparent border-b border-gray-200">
                  <TabsTrigger 
                    value="posts" 
                    className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                  >
                    Posts
                  </TabsTrigger>
                  <TabsTrigger 
                    value="photos" 
                    className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                  >
                    Photos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="friends" 
                    className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                  >
                    Friends
                  </TabsTrigger>
                  <TabsTrigger 
                    value="about" 
                    className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                  >
                    About
                  </TabsTrigger>
                  <TabsTrigger 
                    value="family" 
                    className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                  >
                    Family
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Content */}
              <div className="pb-6">
                <TabsContent value="posts">
              {showCreatePostForm && (
                <div className="mb-4">
                  <CreatePost onClose={() => setShowCreatePostForm(false)} />
                </div>
              )}
              
              {postsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : posts.length === 0 && !showCreatePostForm ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <p className="text-gray-500">No posts yet. Share something with your friends!</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setShowCreatePostForm(true)}
                  >
                    Create your first post
                  </Button>
                </div>
              ) : (
                <>
                  {!showCreatePostForm && posts.length > 0 && (
                    <div className="mb-4">
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => setShowCreatePostForm(true)}
                      >
                        Create New Post
                      </Button>
                    </div>
                  )}
                  
                  {posts.map((post) => (
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
                  ))}
                </>
              )}
            </TabsContent>

            <TabsContent value="photos">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {/* Add photo grid here */}
                  <p className="col-span-full text-center text-gray-500">No photos uploaded yet.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="friends">
              <div className="bg-white rounded-lg shadow-sm p-6">
                {friendsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center">
                    <p className="text-gray-500">No friends added yet.</p>
                    <Button className="mt-4">Find Friends</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {friends.map((friend) => (
                      <div key={friend.id} className="flex flex-col items-center text-center">
                        <Avatar className="h-16 w-16 mb-2 rounded-md">
                          <AvatarImage src={friend.profilePicture} alt={friend.displayName}  />
                          <AvatarFallback className="rounded-md">{friend.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium text-sm">{friend.displayName}</p>
                        <p className="text-xs text-gray-500">@{friend.username}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="about">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium mb-4">About</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                    <p className="mt-1">{enhancedUser.bio || "No bio added yet."}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <p className="mt-1">{enhancedUser.location || "No location added yet."}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Joined</h3>
                    <p className="mt-1">{userJoinDate}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile Information
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="family">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Family Tree</h2>
                  <Button 
                    onClick={() => setIsFamilyDialogOpen(true)}
                    className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Family Member
                  </Button>
                </div>
                
                {familyDataLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  </div>
                ) : !familyData ? (
                  <div className="text-center py-12 border-2 border-dashed border-primary/10 rounded-xl bg-primary/5">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Family Data Yet</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">Start building your lineage by adding relatives from your friends list.</p>
                    <Button onClick={() => setIsFamilyDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Member
                    </Button>
                  </div>
                ) : (
                  <FamilyTree familyData={familyData} />
                )}
              </div>
            </TabsContent>
              </div>
            </Tabs>
          </div>
        
        {/* Edit Profile Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {enhancedUser && (
                <ProfileEditForm 
                  user={{
                    id: enhancedUser.id,
                    displayName: enhancedUser.displayName || enhancedUser.username,
                    username: enhancedUser.username,
                    bio: enhancedUser.bio,
                    location: enhancedUser.location,
                    profilePicture: enhancedUser.profilePicture,
                    coverImage: enhancedUser.coverImage
                  }}
                  onSuccess={handleProfileUpdateSuccess}
                  onCancel={() => setIsEditDialogOpen(false)}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Family Member Dialog */}
        <FamilyMemberDialog
          isOpen={isFamilyDialogOpen}
          onClose={() => setIsFamilyDialogOpen(false)}
          onSave={(data) => updateFamilyMutation.mutate(data)}
          friends={unlinkedFriends}
        />
      </Layout>
    );
  }
