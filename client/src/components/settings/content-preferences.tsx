import { UserSettings, InsertUserSettings } from "@shared/schema";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContentPreferencesProps {
  settings: UserSettings;
  onUpdate: (settings: Partial<InsertUserSettings>) => void;
}

export function ContentPreferences({ settings, onUpdate }: ContentPreferencesProps) {
  const defaultContentPreferences = {
    feedType: "balanced",
    postDisplay: "expanded",
    defaultSort: "newest",
    contentFilters: [] as string[],
  };

  const contentPreferences = settings.contentPreferences ?? defaultContentPreferences;

  const handleValueChange = (key: keyof typeof defaultContentPreferences) => (value: string) => {
    onUpdate({
      contentPreferences: {
        ...contentPreferences,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <Label>Content Preferences</Label>
      <div className="space-y-2">
        {/* Feed Type */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="feedType">Feed Type</Label>
            <p className="text-sm text-muted-foreground">
              Choose how your feed is organized
            </p>
          </div>
          <Select
            value={contentPreferences.feedType}
            onValueChange={handleValueChange("feedType")}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select feed type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="chronological">Chronological</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Post Display */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="postDisplay">Post Display</Label>
            <p className="text-sm text-muted-foreground">
              Choose how posts are displayed
            </p>
          </div>
          <Select
            value={contentPreferences.postDisplay}
            onValueChange={handleValueChange("postDisplay")}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select display" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expanded">Expanded</SelectItem>
              <SelectItem value="compact">Compact</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Default Sort */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="defaultSort">Default Sort</Label>
            <p className="text-sm text-muted-foreground">
              Choose default sorting for posts
            </p>
          </div>
          <Select
            value={contentPreferences.defaultSort}
            onValueChange={handleValueChange("defaultSort")}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
