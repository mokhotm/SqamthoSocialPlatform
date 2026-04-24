import { useQuery } from "@tanstack/react-query";
import { Users, UserPlus, Settings, MessageSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getQueryFn } from "@/lib/queryClient";
import { Group } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import Layout from "@/components/layout";

function GroupCard({ group }: { group: Group }) {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-inner">
              <Users className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{group.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{group.description || 'No description available'}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <UserPlus className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-6 text-sm text-muted-foreground pt-2 border-t">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>{group.memberCount} members</span>
          </div>
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>{group.messageCount} messages</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function CreateGroupButton() {
  return (
    <Button 
      size="lg"
      className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <UserPlus className="h-5 w-5 mr-2" />
      Create New Group
    </Button>
  );
}

function GroupsPage() {
  const { } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  
  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
    queryFn: getQueryFn({ on401: "returnNull" })
  });

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (group.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Groups
                </h1>
                <p className="text-muted-foreground mt-1">Join and create groups with like-minded people</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search groups..." 
                    className="pl-9 w-full sm:w-[300px] bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Create Group Button - Top */}
            <CreateGroupButton />

            {/* Groups Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-1">
                    {searchQuery ? 'No groups found' : 'No groups yet'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery 
                      ? 'Try adjusting your search query'
                      : 'Create your first group to get started'}
                  </p>
                </div>
              )}
            </div>
          </div>
    </Layout>
  );
}

export default GroupsPage;
