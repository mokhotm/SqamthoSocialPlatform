import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import MessagesPage from "@/pages/messages-page";
import SettingsPage from "@/pages/settings-page";
import ExplorePage from "@/pages/explore-page";
import CommunitiesPage from "@/pages/communities-page";
import CommunityPage from "@/pages/community-page";
import FriendsPage from "@/pages/friends-page";
import SavedPostsPage from "@/pages/saved-posts-page";
import MemoriesPage from "@/pages/memories-page";
import MarketplacePage from "@/pages/marketplace-page";
import GroupsPage from "@/pages/groups-page";
import EventsPage from "@/pages/events-page";
import HealthPage from "./pages/health-page";
import MoneyPage from "./pages/money-page";
import TestPage from "./pages/test-page";
import MinimalTest from "./pages/minimal-test";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { ThemeProvider } from "./hooks/use-theme";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/messages" component={MessagesPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/explore" component={ExplorePage} />
      <ProtectedRoute path="/friends" component={FriendsPage} />
      <ProtectedRoute path="/saved-posts" component={SavedPostsPage} />
      <ProtectedRoute path="/memories" component={MemoriesPage} />
      <ProtectedRoute path="/marketplace" component={MarketplacePage} />
      <ProtectedRoute path="/communities/:id" component={CommunityPage} />
      <ProtectedRoute path="/communities" component={CommunitiesPage} />
      <ProtectedRoute path="/groups" component={GroupsPage} />
      <ProtectedRoute path="/events" component={EventsPage} />
      <ProtectedRoute path="/health" component={HealthPage} />
      <ProtectedRoute path="/money" component={MoneyPage} />
      <Route path="/test" component={TestPage} />
      <Route path="/minimal" component={MinimalTest} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
