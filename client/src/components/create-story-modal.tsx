import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { Image as ImageIcon, X, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateStoryModal({ isOpen, onClose }: CreateStoryModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createStoryMutation = useMutation({
    mutationFn: async ({ content, imageUrl }: { content?: string; imageUrl?: string }) => {
      const res = await apiRequest("POST", "/api/stories", { content, imageUrl });
      return await res.json();
    },
    onSuccess: () => {
      setContent("");
      setImagePreview(null);
      setUploadedImageUrl(null);
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      toast({
        title: "Story created",
        description: "Your story has been shared with your friends",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Failed to create story",
        description: "There was an error sharing your story",
        variant: "destructive",
      });
    }
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Show local preview
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
      } catch (err) {
        toast({
          title: "Upload failed",
          description: "Could not upload the image. Please try again.",
          variant: "destructive",
        });
        setImagePreview(null);
        setUploadedImageUrl(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedImageUrl || content.trim()) {
      createStoryMutation.mutate({
        content: content.trim() || undefined,
        imageUrl: uploadedImageUrl || undefined,
      });
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setUploadedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Story</DialogTitle>
          <DialogDescription>
            Share a moment with your friends. Stories disappear after 24 hours.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profilePicture} alt={user?.displayName} />
              <AvatarFallback className="bg-primary text-white">
                {user?.displayName?.charAt(0) || user?.username?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <p className="font-medium text-sm">{user?.displayName}</p>
          </div>

          <div className="space-y-2">
            <textarea
              placeholder="What's happening?"
              className="w-full min-h-[100px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {imagePreview ? (
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              <img src={imagePreview} alt="Story Preview" className="w-full h-auto max-h-[300px] object-contain bg-black" />
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
              <button
                type="button"
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Add a photo to your story</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createStoryMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createStoryMutation.isPending || isUploading || (!uploadedImageUrl && !content.trim())}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {createStoryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : "Share Now"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
