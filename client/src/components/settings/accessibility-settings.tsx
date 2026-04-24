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

interface AccessibilitySettingsProps {
  settings: UserSettings;
  onUpdate: (settings: Partial<InsertUserSettings>) => void;
}

export function AccessibilitySettings({ settings, onUpdate }: AccessibilitySettingsProps) {
  const defaultAccessibilitySettings = {
    fontSize: "medium",
    highContrast: false,
    reducedMotion: false,
    screenReaderOptimized: false,
  };

  const accessibilitySettings = settings.accessibilitySettings ?? defaultAccessibilitySettings;

  const handleValueChange = (key: keyof typeof defaultAccessibilitySettings) => (value: string | boolean) => {
    onUpdate({
      accessibilitySettings: {
        ...accessibilitySettings,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <Label>Accessibility Settings</Label>
      <div className="space-y-2">
        {/* Font Size */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="fontSize">Font Size</Label>
            <p className="text-sm text-muted-foreground">
              Choose your preferred font size
            </p>
          </div>
          <Select
            value={accessibilitySettings.fontSize}
            onValueChange={handleValueChange("fontSize")}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="highContrast">High Contrast</Label>
            <p className="text-sm text-muted-foreground">
              Enable high contrast mode
            </p>
          </div>
          <Switch
            id="highContrast"
            checked={accessibilitySettings.highContrast}
            onCheckedChange={handleValueChange("highContrast")}
          />
        </div>

        {/* Reduced Motion */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="reducedMotion">Reduced Motion</Label>
            <p className="text-sm text-muted-foreground">
              Minimize animations and transitions
            </p>
          </div>
          <Switch
            id="reducedMotion"
            checked={accessibilitySettings.reducedMotion}
            onCheckedChange={handleValueChange("reducedMotion")}
          />
        </div>

        {/* Screen Reader Optimized */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="screenReaderOptimized">Screen Reader Optimized</Label>
            <p className="text-sm text-muted-foreground">
              Optimize content for screen readers
            </p>
          </div>
          <Switch
            id="screenReaderOptimized"
            checked={accessibilitySettings.screenReaderOptimized}
            onCheckedChange={handleValueChange("screenReaderOptimized")}
          />
        </div>
      </div>
    </div>
  );
}
