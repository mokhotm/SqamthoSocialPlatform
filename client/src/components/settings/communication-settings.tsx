import { UserSettings, InsertUserSettings } from "@shared/schema";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CommunicationSettingsProps {
  settings: UserSettings;
  onUpdate: (settings: Partial<InsertUserSettings>) => void;
}

export function CommunicationSettings({
  settings,
  onUpdate,
}: CommunicationSettingsProps) {
  const defaultCommunicationSettings = {
    messagePrivacy: "everyone" as const,
    readReceipts: true,
    typingIndicators: true,
    lastSeenPrivacy: "everyone" as const,
  };

  const communicationSettings = settings.communicationSettings ?? defaultCommunicationSettings;

  const handleValueChange = (key: keyof typeof defaultCommunicationSettings) => (value: string | boolean) => {
    onUpdate({
      communicationSettings: {
        ...communicationSettings,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <Label>Communication Settings</Label>
      <div className="space-y-2">
        {/* Message Privacy */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="messagePrivacy">Message Privacy</Label>
            <p className="text-sm text-muted-foreground">
              Control who can send you messages
            </p>
          </div>
          <Select
            value={communicationSettings.messagePrivacy}
            onValueChange={handleValueChange("messagePrivacy")}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select privacy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="everyone">Everyone</SelectItem>
              <SelectItem value="friends">Friends Only</SelectItem>
              <SelectItem value="none">No One</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Read Receipts */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="readReceipts">Read Receipts</Label>
            <p className="text-sm text-muted-foreground">
              Show when you've read messages
            </p>
          </div>
          <Switch
            id="readReceipts"
            checked={communicationSettings.readReceipts}
            onCheckedChange={handleValueChange("readReceipts")}
          />
        </div>

        {/* Typing Indicators */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="typingIndicators">Typing Indicators</Label>
            <p className="text-sm text-muted-foreground">
              Show when you're typing
            </p>
          </div>
          <Switch
            id="typingIndicators"
            checked={communicationSettings.typingIndicators}
            onCheckedChange={handleValueChange("typingIndicators")}
          />
        </div>

        {/* Last Seen Privacy */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="lastSeenPrivacy">Last Seen Privacy</Label>
            <p className="text-sm text-muted-foreground">
              Control who can see your last seen status
            </p>
          </div>
          <Select
            value={communicationSettings.lastSeenPrivacy}
            onValueChange={handleValueChange("lastSeenPrivacy")}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select privacy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="everyone">Everyone</SelectItem>
              <SelectItem value="friends">Friends Only</SelectItem>
              <SelectItem value="none">No One</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
