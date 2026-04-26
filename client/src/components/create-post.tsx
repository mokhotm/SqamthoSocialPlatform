import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Image, Smile, MapPin, X, Sparkles, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const FEELINGS = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😍", label: "Loved" },
  { emoji: "🎉", label: "Celebrating" },
  { emoji: "🤔", label: "Thoughtful" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😤", label: "Frustrated" },
  { emoji: "🥰", label: "Grateful" },
  { emoji: "😎", label: "Cool" },
  { emoji: "🤩", label: "Excited" },
  { emoji: "😴", label: "Tired" },
  { emoji: "🥳", label: "Party mood" },
  { emoji: "💪", label: "Motivated" },
];

const POPULAR_LOCATIONS = [
  "📍 Johannesburg, South Africa",
  "📍 Cape Town, South Africa",
  "📍 Durban, South Africa",
  "📍 Pretoria, South Africa",
  "📍 Soweto, South Africa",
  "📍 Port Elizabeth, South Africa",
  "📍 Sandton City, Johannesburg",
  "📍 V&A Waterfront, Cape Town",
  "📍 Table Mountain, Cape Town",
  "📍 uShaka Marine World, Durban",
  "📍 Kruger National Park",
  "📍 Bloemfontein, South Africa",
];

export default function CreatePost({ friend, onClose }: { friend?: { displayName: string }, onClose?: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState(friend ? `Thinking about @${friend.displayName}... ` : "");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [feeling, setFeeling] = useState<{ emoji: string; label: string } | null>(null);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkInSearch, setCheckInSearch] = useState("");
  const [isFeelingOpen, setIsFeelingOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    try {
      setIsAILoading(true);
      const response = await apiRequest("POST", "/api/ai/generate-post", {
        prompt: aiPrompt,
        feeling: feeling?.label,
        location: checkIn,
      });

      if (!response.ok) throw new Error("Failed to generate post");

      const data = await response.json();
      setContent(data.content);
      setIsAIOpen(false);
      setAiPrompt("");
      toast({
        title: "AI Draft Generated",
        description: "Your post has been drafted. You can edit it before posting.",
      });
    } catch (error) {
      toast({
        title: "AI Generation Failed",
        description: "Failed to generate a post draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAILoading(false);
    }
  };

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async ({ content, imageUrl }: { content: string; imageUrl?: string }) => {
      const res = await apiRequest("POST", "/api/posts", { content, imageUrl });
      return await res.json();
    },
    onSuccess: () => {
      setContent(friend ? `Thinking about @${friend.displayName}... ` : "");
      setImagePreview(null);
      setUploadedImageUrl(null);
      setFeeling(null);
      setCheckIn(null);
      console.log("Post created successfully, invalidating queries...");
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast({
        title: "Post created",
        description: "Your post has been published successfully",
      });
      onClose?.();
    },
    onError: (error) => {
      toast({
        title: "Failed to create post",
        description: "There was an error creating your post",
        variant: "destructive",
      });
    }
  });

  // Build the full post content including feeling and check-in
  const buildFullContent = () => {
    let fullContent = content.trim();
    if (feeling) {
      fullContent += `\n${feeling.emoji} Feeling ${feeling.label}`;
    }
    if (checkIn) {
      fullContent += `\n${checkIn}`;
    }
    return fullContent;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullContent = buildFullContent();
    if (fullContent || uploadedImageUrl) {
      createPostMutation.mutate({
        content: fullContent,
        imageUrl: uploadedImageUrl || undefined,
      });
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Show local preview immediately
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImagePreview(ev.target.result as string);
        }
      };
      reader.readAsDataURL(selectedFile);

      // Upload to server
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();
        setUploadedImageUrl(data.filePath);
        toast({
          title: "Image uploaded",
          description: "Your image is ready to post",
        });
      } catch {
        toast({
          title: "Upload failed",
          description: "There was an error uploading your image. Please try again.",
          variant: "destructive",
        });
        setImagePreview(null);
        setUploadedImageUrl(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setUploadedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const selectFeeling = (f: { emoji: string; label: string }) => {
    setFeeling(f);
    setIsFeelingOpen(false);
  };

  const selectCheckIn = (location: string) => {
    setCheckIn(location);
    setIsCheckInOpen(false);
    setCheckInSearch("");
  };

  const filteredLocations = checkInSearch
    ? POPULAR_LOCATIONS.filter((loc) =>
        loc.toLowerCase().includes(checkInSearch.toLowerCase())
      )
    : POPULAR_LOCATIONS;

  const hasContent = content.trim() || uploadedImageUrl || feeling || checkIn;

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-center space-x-2">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={user?.profilePicture} alt={user?.displayName || user?.username} />
            <AvatarFallback className="bg-primary text-white">
              {user?.displayName?.charAt(0) || user?.username?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <input
              type="text"
              placeholder={`What's on your mind, ${user?.displayName?.split(' ')[0] || user?.username}?`}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>

        {/* Active tags: feeling + check-in */}
        {(feeling || checkIn) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {feeling && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm font-medium border border-orange-200">
                {feeling.emoji} Feeling {feeling.label}
                <button
                  type="button"
                  onClick={() => setFeeling(null)}
                  className="ml-1 hover:text-orange-900"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {checkIn && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                {checkIn}
                <button
                  type="button"
                  onClick={() => setCheckIn(null)}
                  className="ml-1 hover:text-green-900"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
          </div>
        )}
        
        {/* Image preview */}
        {imagePreview && (
          <div className="mt-3 relative">
            <img src={imagePreview} alt="Preview" className="rounded-lg w-full max-h-80 object-contain" />
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                <div className="text-white text-sm font-medium flex items-center gap-2">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Uploading...
                </div>
              </div>
            )}
            <button
              type="button"
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        <div className="flex mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          {/* Photo/Video */}
          <label className="flex items-center justify-center flex-1 p-2 text-muted-foreground hover:bg-accent/50 rounded-lg cursor-pointer transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <Image className="h-5 w-5 text-secondary" />
            <span className="ml-2 text-sm">Photo/Video</span>
          </label>

          {/* Feeling */}
          <Popover open={isFeelingOpen} onOpenChange={setIsFeelingOpen}>
            <PopoverTrigger asChild>
              <button 
                type="button" 
                className="flex items-center justify-center flex-1 p-2 text-muted-foreground hover:bg-accent/50 rounded-lg transition-colors"
              >
                <Smile className="h-5 w-5 text-primary" />
                <span className="ml-2 text-sm">Feeling</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="center">
              <p className="text-sm font-semibold text-gray-700 mb-2">How are you feeling?</p>
              <div className="grid grid-cols-3 gap-1.5">
                {FEELINGS.map((f) => (
                  <button
                    key={f.label}
                    type="button"
                    onClick={() => selectFeeling(f)}
                    className={`flex items-center gap-1.5 px-2 py-2 rounded-lg text-sm hover:bg-orange-50 transition-colors ${
                      feeling?.label === f.label ? "bg-orange-100 ring-1 ring-orange-300" : ""
                    }`}
                  >
                    <span className="text-lg">{f.emoji}</span>
                    <span className="text-xs text-gray-700 truncate">{f.label}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Check In */}
          <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
            <PopoverTrigger asChild>
              <button 
                type="button" 
                className="flex items-center justify-center flex-1 p-2 text-muted-foreground hover:bg-accent/50 rounded-lg transition-colors"
              >
                <MapPin className="h-5 w-5 text-accent" />
                <span className="ml-2 text-sm">Check in</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="end">
              <p className="text-sm font-semibold text-gray-700 mb-2">Where are you?</p>
              <input
                type="text"
                placeholder="Search locations..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mb-2"
                value={checkInSearch}
                onChange={(e) => setCheckInSearch(e.target.value)}
              />
              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {/* Custom location from search */}
                {checkInSearch.trim() && (
                  <button
                    type="button"
                    onClick={() => selectCheckIn(`📍 ${checkInSearch.trim()}`)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-green-50 transition-colors text-primary font-medium"
                  >
                    📍 Use "{checkInSearch.trim()}"
                  </button>
                )}
                {filteredLocations.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => selectCheckIn(loc)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-green-50 transition-colors ${
                      checkIn === loc ? "bg-green-100 ring-1 ring-green-300" : ""
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* AI Assistant */}
          <Popover open={isAIOpen} onOpenChange={setIsAIOpen}>
            <PopoverTrigger asChild>
              <button 
                type="button" 
                className="flex items-center justify-center flex-1 p-2 text-muted-foreground hover:bg-accent/50 rounded-lg transition-colors"
              >
                <Sparkles className="h-5 w-5 text-purple-500" />
                <span className="ml-2 text-sm hidden sm:inline">AI Assist</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="end">
              <p className="text-sm font-semibold text-gray-700 mb-2">What would you like to post about?</p>
              <form onSubmit={handleAIGenerate} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., A funny thing happened today..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  disabled={isAILoading}
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={!aiPrompt.trim() || isAILoading}
                >
                  {isAILoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Draft"}
                </Button>
              </form>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Submit button */}
        {hasContent && (
          <div className="mt-3 flex justify-end">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white"
              disabled={createPostMutation.isPending || isUploading}
            >
              {createPostMutation.isPending ? "Posting..." : isUploading ? "Uploading..." : "Post"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
