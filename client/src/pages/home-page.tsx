import { useInfiniteQuery } from "@tanstack/react-query";
import Layout from "@/components/layout";
import CreatePost from "@/components/create-post";
import Stories from "@/components/stories";
import PostCard from "@/components/post-card";

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
    initialPageParam: 1
  });

  // Example stories data
  const stories = [
    {
      id: 1,
      user: {
        id: 1,
        username: "tumi_k",
        displayName: "Tumi Khumalo",
        profilePicture: "https://randomuser.me/api/portraits/women/45.jpg"
      },
      imageUrl: "https://images.unsplash.com/photo-1516651029879-dee191a1e0f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      user: {
        id: 2,
        username: "sipho_m",
        displayName: "Sipho Mabena",
        profilePicture: "https://randomuser.me/api/portraits/men/22.jpg"
      },
      imageUrl: "https://images.unsplash.com/photo-1523867904486-8153c8af6e4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      user: {
        id: 3,
        username: "mandla_t",
        displayName: "Mandla Thusi",
        profilePicture: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      imageUrl: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
      createdAt: new Date().toISOString()
    },
    {
      id: 4,
      user: {
        id: 4,
        username: "lerato_m",
        displayName: "Lerato Moloi",
        profilePicture: "https://randomuser.me/api/portraits/women/68.jpg"
      },
      imageUrl: "https://images.unsplash.com/photo-1489396160836-2c99c977e970?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
      createdAt: new Date().toISOString()
    }
  ];

  return (
    <Layout>
          {/* Create Post */}
          <CreatePost />
          
          {/* Stories */}
          <Stories stories={stories} />
          
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
