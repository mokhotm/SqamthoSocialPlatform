import Layout from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Loader2, Heart, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function ExploreCard({ post }: { post: any }) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3 mb-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={post.author?.profilePicture} />
          <AvatarFallback>{(post.author?.displayName || 'U')[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-semibold truncate max-w-[150px]">
            {post.author?.displayName || 'User'}
          </span>
          <span className="text-xs text-gray-500">@{post.author?.username || 'user'}</span>
        </div>
      </div>
      
      {post.imageUrl && (
        <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-md mb-4 overflow-hidden">
          <img src={post.imageUrl} alt="Explore" className="w-full h-full object-cover" />
        </div>
      )}
      
      <p className="text-gray-900 dark:text-gray-100 font-medium line-clamp-2 mb-4">
        {post.content}
      </p>
      
      <div className="flex items-center space-x-4 text-xs text-gray-500">
        <span className="flex items-center">
          <Heart className="h-3 w-3 mr-1" />
          {post.likesCount || 0}
        </span>
        <span className="flex items-center">
          <MessageCircle className="h-3 w-3 mr-1" />
          {post.commentsCount || 0}
        </span>
      </div>
    </Card>
  );
}

export default function ExplorePage() {
  const { data: explorePosts = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/explore"],
    queryFn: getQueryFn({ on401: "returnNull" })
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Explore</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Discover new content and communities</p>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search posts, communities, or people..."
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {explorePosts.length > 0 ? (
              explorePosts.map((post) => (
                <ExploreCard key={post.id} post={post} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No content discovered yet</h3>
                <p className="mt-2 text-sm">Check back later for new suggestions and trending content.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
