import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";
import LeftSidebar from "@/components/left-sidebar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Bell, Settings, Share2 } from "lucide-react";
import { useRoute } from "wouter";

export default function CommunityPage() {
  const { user } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [, params] = useRoute("/communities/:id");
  const communityId = params?.id;

  // This would normally come from an API call using the communityId
  const communityData = {
    id: communityId,
    name: communityId === 'tech-hub' ? 'South African Tech Hub' :
          communityId === 'foodies' ? 'Johannesburg Foodies' :
          'Cape Town Photography',
    description: 'A vibrant community for sharing ideas, experiences, and connecting with like-minded individuals.',
    members: 3400,
    posts: 1200,
    isJoined: true
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="container mx-auto flex flex-col md:flex-row pt-20">
        {!isMobile && <LeftSidebar />}
        
        <main className="flex-1 px-4 md:px-6 pb-20">
          <div className="max-w-4xl mx-auto">
            <Card className="mb-6 overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-primary to-secondary" />
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {communityData.name}
                  </h1>
                  <div className="flex items-center space-x-2">
                    {communityData.isJoined ? (
                      <>
                        <Button variant="outline" size="sm">
                          <Bell className="h-4 w-4 mr-2" />
                          Notifications
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                      </>
                    ) : (
                      <Button size="sm">Join Community</Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  {communityData.description}
                </p>
                <div className="flex items-center mt-4 space-x-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    {communityData.members.toLocaleString()} members
                  </div>
                  <div className="text-sm text-gray-500">
                    {communityData.posts.toLocaleString()} posts
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid gap-6">
              <Card className="p-6">
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Community posts coming soon!
                </p>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
