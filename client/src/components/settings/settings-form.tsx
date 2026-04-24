import { useSettings } from "@/hooks/use-settings";
import { UserSettings, InsertUserSettings } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentPreferences } from "./content-preferences";
import { AccessibilitySettings } from "./accessibility-settings";
import { CommunicationSettings } from "./communication-settings";
import { RegionalSettings } from "./regional-settings";
import { SecuritySettings } from "./security-settings";

export function SettingsForm() {
  const { settings, saveSettings, isLoading, isSaving } = useSettings();

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="space-y-6">
        <ContentPreferences settings={settings as UserSettings} onUpdate={saveSettings} />
        <AccessibilitySettings settings={settings as UserSettings} onUpdate={saveSettings} />
        <CommunicationSettings settings={settings as UserSettings} onUpdate={saveSettings} />
        <RegionalSettings settings={settings as UserSettings} onUpdate={saveSettings} />
        <SecuritySettings settings={settings as UserSettings} onUpdate={saveSettings} />

        {/* Language Setting */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="language">Language</Label>
            <p className="text-sm text-muted-foreground">
              Select your preferred language
            </p>
          </div>
          <Select
            value={settings?.language ?? "en"}
            onValueChange={(value: string) => saveSettings({ language: value })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="zu">isiZulu</SelectItem>
              <SelectItem value="xh">isiXhosa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <Label>Notifications</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about important updates
                </p>
              </div>
              <Switch
                id="notifications"
                checked={settings?.notificationsEnabled ?? false}
                onCheckedChange={(checked: boolean) =>
                  saveSettings({ notificationsEnabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings?.emailNotifications ?? false}
                onCheckedChange={(checked: boolean) =>
                  saveSettings({ emailNotifications: checked })
                }
                disabled={!settings?.notificationsEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="pushNotifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications on your device
                </p>
              </div>
              <Switch
                id="pushNotifications"
                checked={settings?.pushNotifications ?? false}
                onCheckedChange={(checked: boolean) =>
                  saveSettings({ pushNotifications: checked })
                }
                disabled={!settings?.notificationsEnabled}
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="space-y-4">
          <Label>Privacy</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="privacyLevel">Profile Privacy</Label>
                <p className="text-sm text-muted-foreground">
                  Control who can see your profile
                </p>
              </div>
              <Select
                value={settings?.privacyLevel || "public"}
                onValueChange={(value) => saveSettings({ privacyLevel: value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select privacy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="friends">Friends</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="onlineStatus">Online Status</Label>
                <p className="text-sm text-muted-foreground">
                  Show when you're online
                </p>
              </div>
              <Switch
                id="onlineStatus"
                checked={settings?.showOnlineStatus}
                onCheckedChange={(checked) =>
                  saveSettings({ showOnlineStatus: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="activityStatus">Activity Status</Label>
                <p className="text-sm text-muted-foreground">
                  Show your activity status
                </p>
              </div>
              <Switch
                id="activityStatus"
                checked={settings?.showActivityStatus}
                onCheckedChange={(checked) =>
                  saveSettings({ showActivityStatus: checked })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <Button disabled={isSaving} className="w-full">
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </Card>
  );
}
