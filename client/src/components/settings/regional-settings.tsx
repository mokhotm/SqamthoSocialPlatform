import { UserSettings, InsertUserSettings } from "@shared/schema";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RegionalSettingsProps {
  settings: UserSettings;
  onUpdate: (settings: Partial<InsertUserSettings>) => void;
}

export function RegionalSettings({ settings, onUpdate }: RegionalSettingsProps) {
  const defaultRegionalSettings = {
    timeZone: "UTC" as const,
    dateFormat: "DD/MM/YYYY" as const,
    timeFormat: "24h" as const,
    currency: "ZAR" as const,
  };

  const regionalSettings = settings.regionalSettings ?? defaultRegionalSettings;

  const handleValueChange = (key: keyof typeof defaultRegionalSettings) => (value: string) => {
    onUpdate({
      regionalSettings: {
        ...regionalSettings,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <Label>Regional Settings</Label>
      <div className="space-y-2">
        {/* Time Zone */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="timeZone">Time Zone</Label>
            <p className="text-sm text-muted-foreground">
              Set your local time zone
            </p>
          </div>
          <Select
            value={regionalSettings.timeZone}
            onValueChange={handleValueChange("timeZone")}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTC">UTC</SelectItem>
              <SelectItem value="Africa/Johannesburg">
                Africa/Johannesburg
              </SelectItem>
              <SelectItem value="Africa/Cairo">Africa/Cairo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Format */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="dateFormat">Date Format</Label>
            <p className="text-sm text-muted-foreground">
              Choose how dates are displayed
            </p>
          </div>
          <Select
            value={regionalSettings.dateFormat}
            onValueChange={handleValueChange("dateFormat")}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time Format */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="timeFormat">Time Format</Label>
            <p className="text-sm text-muted-foreground">
              Choose 12 or 24-hour format
            </p>
          </div>
          <Select
            value={regionalSettings.timeFormat}
            onValueChange={handleValueChange("timeFormat")}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12h">12-hour</SelectItem>
              <SelectItem value="24h">24-hour</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Currency */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="currency">Currency</Label>
            <p className="text-sm text-muted-foreground">
              Set your preferred currency
            </p>
          </div>
          <Select
            value={regionalSettings.currency}
            onValueChange={handleValueChange("currency")}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ZAR">ZAR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
