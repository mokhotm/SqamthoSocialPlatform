import { Users, UserPlus, Settings, MessageSquare, Search, Loader2, Edit2, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { Group, GroupMember } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import Layout from "@/components/layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateGroupDialog } from "@/components/create-group-dialog";
import { EditGroupDialog } from "@/components/edit-group-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function GroupCard({ 
  group, 
  isMember, 
  isAdmin 
}: { 
  group: Group; 
  isMember: boolean; 
  isAdmin: boolean;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const joinMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/groups/${group.id}/join`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: "Joined!", description: `You have joined ${group.name}` });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/groups/${group.id}/leave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: "Left", description: `You have left ${group.name}` });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/groups/${group.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: "Deleted", description: "Group has been deleted" });
    },
  });

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-inner overflow-hidden">
              {group.imageUrl ? (
                <img src={group.imageUrl} alt={group.name} className="h-full w-full object-cover" />
              ) : (
                <Users className="h-7 w-7" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{group.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{group.description || 'No description available'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <EditGroupDialog group={group} />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the group and all its data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            
            {!isMember ? (
              <Button 
                onClick={() => joinMutation.mutate()} 
                disabled={joinMutation.isPending}
                size="sm"
                className="rounded-full"
              >
                {joinMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Join
              </Button>
            ) : (
              <Button 
                onClick={() => leaveMutation.mutate()} 
                disabled={leaveMutation.isPending}
                variant="outline" 
                size="sm"
                className="rounded-full text-destructive hover:bg-destructive/10"
              >
                {leaveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
                Leave
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-sm text-muted-foreground pt-2 border-t font-medium">
          <div className="flex items-center space-x-2">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-3.5 w-3.5 text-primary" />
            </div>
            <span>{group.memberCount} members</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-7 w-7 rounded-full bg-secondary/10 flex items-center justify-center">
              <MessageSquare className="h-3.5 w-3.5 text-secondary" />
            </div>
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
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
    queryFn: getQueryFn({ on401: "returnNull" })
  });

  const { data: joinedGroups = [] } = useQuery<Group[]>({
    queryKey: ["/api/groups", { type: "joined" }],
    queryFn: async () => {
      const response = await fetch("/api/groups?type=joined");
      if (!response.ok) throw new Error("Failed to fetch joined groups");
      return response.json();
    },
    enabled: !!user,
  });

  // We also need to know the user's role in each group to show Edit/Delete
  const { data: userMemberships = [] } = useQuery<GroupMember[]>({
    queryKey: ["/api/user/memberships"],
    queryFn: async () => {
      const response = await fetch("/api/groups/memberships"); // I need to implement this
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user,
  });

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (group.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const joinedIds = new Set(joinedGroups.map(g => g.id));
  const adminIds = new Set(userMemberships.filter(m => m.role === 'admin').map(m => m.groupId));

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
        <CreateGroupDialog />

        {/* Groups Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-12">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <GroupCard 
                  key={group.id} 
                  group={group} 
                  isMember={joinedIds.has(group.id)}
                  isAdmin={adminIds.has(group.id)}
                />
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
        )}
      </div>
    </Layout>
  );
}

export default GroupsPage;
