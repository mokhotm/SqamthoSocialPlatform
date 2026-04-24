import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Bookmark, MoreVertical, Heart, MessageCircle, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data - would come from API in real app
const SAVED_POSTS = [
  {
    id: '1',
    author: {
      name: 'Thabo Mbeki',
      username: 'thabom',
      avatar: null,
    },
    content: 'Just visited the most amazing restaurant in Johannesburg! The fusion of traditional South African cuisine with modern techniques was mind-blowing. 🍽️ #SouthAfricanCuisine #Foodie',
    image: null,
    likes: 245,
    comments: 42,
    savedAt: '2025-04-25T14:30:00Z',
    collection: 'Restaurants'
  },
  {
    id: '2',
    author: {
      name: 'Cape Town Photography',
      username: 'capetownphotos',
      avatar: null,
    },
    content: 'Table Mountain at sunset never disappoints. The way the clouds roll over the top creating the famous "tablecloth" effect is simply magical. 📸 #CapeTown #Photography',
    image: null,
    likes: 789,
    comments: 56,
    savedAt: '2025-04-24T18:15:00Z',
    collection: 'Places to Visit'
  },
  {
    id: '3',
    author: {
      name: 'SA Tech Hub',
      username: 'satechhub',
      avatar: null,
    },
    content: 'Exciting developments in South Africa\'s tech scene! Our startup ecosystem is growing faster than ever. Here are the top 5 startups to watch in 2025... 🚀 #TechStartups #Innovation',
    image: null,
    likes: 567,
    comments: 89,
    savedAt: '2025-04-23T09:45:00Z',
    collection: 'Tech News'
  }
];

const COLLECTIONS = [
  'All Posts',
  'Restaurants',
  'Places to Visit',
  'Tech News',
  'Articles',
  'Videos'
];

function SavedPostCard({ post }: { post: any }) {
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
            Saved to: {post.collection}
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
              <DropdownMenuItem className="text-destructive">
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
          Saved {new Date(post.savedAt).toLocaleDateString()}
        </p>
      </div>
    </Card>
  );
}

export default function SavedPostsPage() {
  const { user } = useAuth();


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

            <Tabs defaultValue="all" className="space-y-6">
              <TabsList className="flex flex-wrap gap-2">
                {COLLECTIONS.map((collection) => (
                  <TabsTrigger key={collection} value={collection.toLowerCase().replace(/\s+/g, '-')}>
                    {collection}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {SAVED_POSTS.map(post => (
                  <SavedPostCard key={post.id} post={post} />
                ))}
              </TabsContent>

              {COLLECTIONS.slice(1).map((collection) => (
                <TabsContent 
                  key={collection} 
                  value={collection.toLowerCase().replace(/\s+/g, '-')}
                  className="space-y-4"
                >
                  {SAVED_POSTS
                    .filter(post => post.collection === collection)
                    .map(post => (
                      <SavedPostCard key={post.id} post={post} />
                    ))
                  }
                </TabsContent>
              ))}
            </Tabs>
          </div>
    </Layout>
  );
}
