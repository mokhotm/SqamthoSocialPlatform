import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout";
import CreatePost from "@/components/create-post";
import Stories from "@/components/stories";
import PostCard from "@/components/post-card";
import { useAuth } from "@/hooks/use-auth";

interface Story {
  id: number;
  user: {
    id: number;
    username: string;
    displayName: string;
    profilePicture: string | null;
  };
  imageUrl: string | null;
  content: string | null;
  createdAt: string;
}

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function HomePage() {
  const { user } = useAuth();
  
  // Fetch posts
  const { 
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage 
} = useInfiniteQuery<Post[]>({
  queryKey: ["/api/posts"],
  getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!user,
  });

  // Fetch stories
  const { data: storiesData = [] } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
    enabled: !!user,
  });

  return (
    <Layout>
          {/* Create Post */}
          <CreatePost />
          
          {/* Stories */}
          {/* Stories */}
          <Stories stories={storiesData} />
          
          {/* Posts Feed */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500 mb-4">Failed to load posts</p>
              <Button 
                onClick={() => refetch()} 
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          ) : !data?.pages[0] || data.pages[0].length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">No posts yet. Be the first to post!</p>
            </div>
          ) : (
            <>
              {data?.pages.map((page) => 
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
              
              {hasNextPage && (
                <div className="flex justify-center pb-6 pt-2">
                  <Button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    variant="outline"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-500 px-4 py-2 rounded-full flex items-center"
                  >
                    {isFetchingNextPage ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                    {isFetchingNextPage ? "Loading..." : "Load more posts"}
                  </Button>
                </div>
              )}
            </>
          )}
    </Layout>
  );
}
