import { useQuery, useMutation } from "@tanstack/react-query";
import { UserSettings, InsertUserSettings } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

export function useSettings() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user settings
  const {
    data: settings,
    error: fetchError,
    isLoading,
  } = useQuery<UserSettings>({
    queryKey: [`/api/user-settings/${user?.id}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user, // Only fetch if user is logged in
  });

  // Create settings mutation
  const createSettingsMutation = useMutation({
    mutationFn: async (newSettings: InsertUserSettings) => {
      const response = await apiRequest(
        "POST",
        "/api/user-settings",
        {
          ...newSettings,
          contentPreferences: newSettings.contentPreferences || {
            feedType: "balanced",
            postDisplay: "expanded",
            defaultSort: "newest",
            contentFilters: [],
          },
          accessibilitySettings: newSettings.accessibilitySettings || {
            fontSize: "medium",
            highContrast: false,
            reducedMotion: false,
            screenReaderOptimized: false,
          },
          communicationSettings: newSettings.communicationSettings || {
            messagePrivacy: "everyone",
            readReceipts: true,
            typingIndicators: true,
            lastSeenPrivacy: "everyone",
          },
          regionalSettings: newSettings.regionalSettings || {
            timeZone: "UTC",
            dateFormat: "DD/MM/YYYY",
            timeFormat: "24h",
            currency: "ZAR",
          },
          securitySettings: newSettings.securitySettings || {
            twoFactorEnabled: false,
            loginAlerts: true,
            trustedDevices: [],
            activeSessions: [],
          },
        }
      );
      return response.json();
    },
    onSuccess: (data: UserSettings) => {
      queryClient.setQueryData([`/api/user-settings/${user?.id}`], data);
      toast({
        title: "Settings created",
        description: "Your settings have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to create settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<InsertUserSettings>) => {
      const response = await apiRequest(
        "PUT",
        `/api/user-settings/${user?.id}`,
        updatedSettings
      );
      return response.json();
    },
    onSuccess: (data: UserSettings) => {
      queryClient.setQueryData([`/api/user-settings/${user?.id}`], data);
      toast({
        title: "Settings updated",
        description: "Your settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Save settings
  const saveSettings = async (updatedSettings: Partial<InsertUserSettings>) => {
    if (!user) return;

    try {
      if (!settings) {
        // If settings don't exist, create them
        await createSettingsMutation.mutateAsync({
          userId: user.id,
          ...updatedSettings,
        } as InsertUserSettings);
      } else {
        // If settings exist, update them
        await updateSettingsMutation.mutateAsync(updatedSettings);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  return {
    settings,
    saveSettings,
    isLoading,
    isSaving: createSettingsMutation.isPending || updateSettingsMutation.isPending,
    error: fetchError,
  };
}
