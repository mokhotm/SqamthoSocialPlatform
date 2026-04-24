import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Shield, BellRing, Eye, Paintbrush, Languages, Bell, Lock, User, UserCheck, ZapIcon, LogOut } from "lucide-react";

export default function SettingsPage() {
  const { user, logoutMutation } = useAuth();

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("appearance");

  // Function to simulate saving settings
  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };

  return (
    <Layout>
        <div className="space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account settings and preferences</p>
          </div>
          
          {!user ? <div>Not logged in</div> : null}
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
            <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
              <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
                <TabsList className="w-full justify-start gap-2 overflow-x-auto bg-transparent h-auto p-0">
                  <TabsTrigger
                    value="appearance"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md py-2 px-3"
                  >
                    <Paintbrush className="h-4 w-4 mr-2" />
                    Appearance
                  </TabsTrigger>
                  <TabsTrigger
                    value="account"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md py-2 px-3"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </TabsTrigger>
                  <TabsTrigger
                    value="privacy"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md py-2 px-3"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Privacy
                  </TabsTrigger>
                  <TabsTrigger
                    value="notifications"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md py-2 px-3"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="pt-6">
                <TabsContent value="appearance" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Appearance Settings</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Adjust the look and feel of the platform</p>
                    </div>
                    <ThemeToggle />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveSettings}>Save Appearance Settings</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="account" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Information</h3>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input id="name" defaultValue={user?.displayName} className="dark:bg-gray-800 dark:border-gray-700" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" defaultValue={user?.username} className="dark:bg-gray-800 dark:border-gray-700" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="user@example.com" className="dark:bg-gray-800 dark:border-gray-700" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input id="bio" defaultValue={user?.bio || ""} className="dark:bg-gray-800 dark:border-gray-700" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Password</h3>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" className="dark:bg-gray-800 dark:border-gray-700" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" className="dark:bg-gray-800 dark:border-gray-700" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" className="dark:bg-gray-800 dark:border-gray-700" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveSettings}>Save Account Settings</Button>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Danger Zone</h3>
                    <div className="flex flex-col md:flex-row gap-4">
                      <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                        onClick={() => toast({
                          title: "Not implemented",
                          description: "This feature is coming soon!",
                          variant: "destructive"
                        })}
                      >
                        Delete Account
                      </Button>
                      <Button variant="outline" className="border-amber-300 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950 dark:hover:text-amber-300"
                        onClick={() => logoutMutation.mutate()}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="privacy" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Privacy Settings</h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Profile Visibility</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Control who can see your profile</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <select className="border border-gray-300 dark:border-gray-700 rounded-md text-sm py-1 px-2 bg-white dark:bg-gray-800 dark:text-white"
                            onChange={() => toast({
                              title: "Not implemented",
                              description: "This feature is coming soon!",
                            })}
                          >
                            <option>Everyone</option>
                            <option>Friends Only</option>
                            <option>Private</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Online Status</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Show when you're active on Sqamtho</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary"
                            onClick={() => toast({
                              title: "Not implemented",
                              description: "This feature is coming soon!",
                            })}
                          >
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Read Receipts</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Let others know when you've read their messages</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary"
                            onClick={() => toast({
                              title: "Not implemented",
                              description: "This feature is coming soon!",
                            })}
                          >
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveSettings}>Save Privacy Settings</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="notifications" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Messages</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications for new messages</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary"
                            onClick={() => toast({
                              title: "Not implemented",
                              description: "This feature is coming soon!",
                            })}
                          >
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Friend Requests</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications for friend requests</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary"
                            onClick={() => toast({
                              title: "Not implemented",
                              description: "This feature is coming soon!",
                            })}
                          >
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Post Engagement</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications when someone interacts with your posts</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary"
                            onClick={() => toast({
                              title: "Not implemented",
                              description: "This feature is coming soon!",
                            })}
                          >
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Marketing Emails</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive promotional emails from Sqamtho</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700"
                            onClick={() => toast({
                              title: "Not implemented",
                              description: "This feature is coming soon!",
                            })}
                          >
                            <span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white dark:bg-gray-400 transition" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveSettings}>Save Notification Settings</Button>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
    </Layout>
  );
}