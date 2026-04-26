import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Bookmark, MoreVertical, Heart, MessageCircle, Share2, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, queryClient } from "@/lib/queryClient";
import { SavedPost, Post } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const COLLECTIONS = [
  'All Posts',
  'Restaurants',
  'Places to Visit',
  'Tech News',
  'Articles',
  'Videos'
];

function SavedPostCard({ savedPost }: { savedPost: any }) {
  // In a real app, the savedPost would include the actual post details
  // For now, we'll assume the API returns the post object or we fetch it
  const post = savedPost.post || {
    id: savedPost.postId,
    author: { name: 'User', username: 'user', avatar: null },
    content: 'Post content loading...',
    likes: 0,
    comments: 0,
    createdAt: savedPost.createdAt
  };

  const removeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/saved-posts/${post.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-posts"] });
    }
  });

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {post.author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{post.author.name}</p>
            <p className="text-sm text-gray-500">@{post.author.username}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm text-gray-500">
            Saved to: {savedPost.collectionName || 'All Posts'}
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                Move to Collection
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => removeMutation.mutate()}
                disabled={removeMutation.isPending}
              >
                {removeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Remove from Saved
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-gray-900 dark:text-gray-100">{post.content}</p>
        {post.image && (
          <div className="mt-3 rounded-lg overflow-hidden">
            <img src={post.image} alt="Post content" className="w-full" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary">
            <Heart className="h-4 w-4 mr-1" />
            {post.likes}
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary">
            <MessageCircle className="h-4 w-4 mr-1" />
            {post.comments}
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Saved {new Date(savedPost.createdAt).toLocaleDateString()}
        </p>
      </div>
    </Card>
  );
}

export default function SavedPostsPage() {
  const { user } = useAuth();

  const { data: savedPosts = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/saved-posts"],
    queryFn: getQueryFn({ on401: "returnNull" })
  });

  return (
    <Layout>
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Saved Posts</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Your collection of saved content</p>
              </div>
              <Button>
                <Bookmark className="h-4 w-4 mr-2" />
                New Collection
              </Button>
            </div>

            <Card className="p-4 mb-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Search saved posts..."
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </Card>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Tabs defaultValue="all" className="space-y-6">
                <TabsList className="flex flex-wrap gap-2">
                  {COLLECTIONS.map((collection) => (
                    <TabsTrigger key={collection} value={collection.toLowerCase().replace(/\s+/g, '-')}>
                      {collection}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {savedPosts.length > 0 ? (
                    savedPosts.map(saved => (
                      <SavedPostCard key={saved.id} savedPost={saved} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No saved posts yet.</p>
                    </div>
                  )}
                </TabsContent>

                {COLLECTIONS.slice(1).map((collection) => (
                  <TabsContent 
                    key={collection} 
                    value={collection.toLowerCase().replace(/\s+/g, '-')}
                    className="space-y-4"
                  >
                    {savedPosts
                      .filter(saved => saved.collectionName === collection)
                      .map(saved => (
                        <SavedPostCard key={saved.id} savedPost={saved} />
                      ))
                    }
                    {savedPosts.filter(saved => saved.collectionName === collection).length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        No posts in this collection.
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
    </Layout>
  );
}
