import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ThumbsUp,
  Smile,
  Gift,
  Pencil,
  Trash2,
  X,
  ImagePlus,
  Sparkles,
  Loader2,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SouthAfricanAccent } from "./ui/south-african-pattern";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Author {
  id: number;
  username: string;
  displayName: string;
  profilePicture: string;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: Author;
}

interface PostProps {
  id: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  author: Author;
  comments: Comment[];
  reactions: {
    count: number;
    types: Record<string, number>;
  };
}

export default function PostCard({
  id,
  content,
  imageUrl,
  createdAt,
  author,
  comments,
  reactions,
}: PostProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [isAISuggesting, setIsAISuggesting] = useState(false);

  // Edit post state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [editImageUrl, setEditImageUrl] = useState<string | null | undefined>(imageUrl);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Delete post state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Check if the current user owns this post
  const isOwner = user?.id === author.id;

  // Calculate if the post is liked by the current user
  const hasLiked = false; // This should be determined from the backend

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/posts/${id}/comments`, {
        content,
      });
      return await res.json();
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to add comment",
        description: "There was an error adding your comment",
        variant: "destructive",
      });
    },
  });

  // Toggle like mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (hasLiked) {
        await apiRequest("DELETE", `/api/posts/${id}/reactions`);
      } else {
        await apiRequest("POST", `/api/posts/${id}/reactions`, {
          type: "like",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: () => {
      toast({
        title: "Failed to update reaction",
        description: "There was an error updating your reaction",
        variant: "destructive",
      });
    },
  });

  // Edit post mutation
  const editPostMutation = useMutation({
    mutationFn: async (data: { content: string; imageUrl: string | null }) => {
      const res = await apiRequest("PATCH", `/api/posts/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      // Also invalidate profile queries in case the post is viewed on the profile page
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Post updated",
        description: "Your post has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update post",
        description: "There was an error updating your post",
        variant: "destructive",
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/posts/${id}`);
    },
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete post",
        description: "There was an error deleting your post",
        variant: "destructive",
      });
    },
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment);
    }
  };

  const handleAISuggestion = async () => {
    try {
      setIsAISuggesting(true);
      const response = await apiRequest("POST", "/api/ai/suggest-comment", {
        postContent: content,
      });

      if (!response.ok) throw new Error("Failed to generate suggestion");

      const data = await response.json();
      setNewComment(data.comment);
      toast({
        title: "AI Suggestion Generated",
        description: "You can edit the suggestion before posting.",
      });
    } catch (error) {
      toast({
        title: "AI Suggestion Failed",
        description: "Failed to generate a comment suggestion.",
        variant: "destructive",
      });
    } finally {
      setIsAISuggesting(false);
    }
  };

  const handleLike = () => {
    toggleLikeMutation.mutate();
  };

  const handleOpenEditDialog = () => {
    setEditContent(content);
    setEditImageUrl(imageUrl);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim()) {
      toast({
        title: "Post content required",
        description: "Post content cannot be empty",
        variant: "destructive",
      });
      return;
    }
    editPostMutation.mutate({
      content: editContent,
      imageUrl: editImageUrl ?? null,
    });
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setEditImageUrl(data.filePath);
    } catch {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const formattedDate = () => {
    const date = new Date(createdAt);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday =
      new Date(now.setDate(now.getDate() - 1)).toDateString() ===
      date.toDateString();

    if (isToday) {
      return `Today at ${format(date, "h:mm a")}`;
    } else if (isYesterday) {
      return `Yesterday at ${format(date, "h:mm a")}`;
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };

  const visibleComments = showAllComments ? comments : comments.slice(0, 2);

  return (
    <div className="post-card relative bg-white mb-6">
      <SouthAfricanAccent className="absolute inset-0" />
      <div className="p-5 relative z-10">
        {/* Post Header */}
        <div className="flex items-start">
          <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-primary/20">
            <AvatarImage src={author.profilePicture} alt={author.displayName} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
              {author.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3 flex-1">
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {author.displayName}
            </p>
            <div className="flex items-center text-xs text-gray-500">
              <span>{formattedDate()}</span>
              <span className="mx-1.5 w-1 h-1 bg-gray-300 rounded-full inline-block"></span>
              <span className="flex items-center text-primary/60">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Public</span>
              </span>
            </div>
          </div>

          {/* More menu - shows edit/delete for owner */}
          {isOwner ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 transition-colors duration-200">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={handleOpenEditDialog}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  <span>Edit Post</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Post</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 transition-colors duration-200">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Post Content */}
        <div className="mt-4 text-gray-800 dark:text-gray-200 leading-relaxed">
          <p>{content}</p>
        </div>

        {/* Post Image */}
        {imageUrl && (
          <div className="mt-4 rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <img
              src={imageUrl}
              alt="Post"
              className="w-full h-auto transform hover:scale-[1.01] transition-transform duration-300"
            />
          </div>
        )}

        {/* Reactions Summary */}
        {reactions.count > 0 && (
          <div className="mt-4 flex items-center">
            <div className="flex -space-x-1">
              <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                <ThumbsUp className="h-3 w-3" />
              </div>
              <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                <Heart className="h-3 w-3" />
              </div>
              <div className="h-6 w-6 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs">
                <Smile className="h-3 w-3" />
              </div>
            </div>
            <span className="ml-2 text-sm text-gray-500">
              {reactions.count}
            </span>
            {comments.length > 0 && (
              <span className="ml-auto text-sm text-gray-500">
                {comments.length} comment{comments.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-4 gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center justify-center rounded-lg ${
              hasLiked
                ? "text-primary bg-primary/5"
                : "text-gray-600 hover:bg-primary/5 hover:text-primary"
            } transition-colors duration-200`}
            onClick={handleLike}
          >
            <Heart
              className={`h-5 w-5 mr-1.5 ${hasLiked ? "fill-current" : ""}`}
            />
            <span>Like</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center justify-center rounded-lg text-gray-600 hover:bg-secondary/5 hover:text-secondary transition-colors duration-200"
          >
            <MessageCircle className="h-5 w-5 mr-1.5" />
            <span>Comment</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center justify-center rounded-lg text-gray-600 hover:bg-accent/5 hover:text-accent transition-colors duration-200"
          >
            <Share2 className="h-5 w-5 mr-1.5" />
            <span>Share</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            <Gift className="h-5 w-5 mr-1.5" />
            <span>Gift</span>
          </Button>
        </div>

        {/* Comments Section */}
        {comments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {visibleComments.map((comment) => (
              <div key={comment.id} className="flex items-start mb-4 group">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage
                    src={comment.author.profilePicture}
                    alt={comment.author.displayName}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-secondary to-primary/70 text-white">
                    {comment.author.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-2 flex-1">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-2.5 relative chat-bubble-received">
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {comment.author.displayName}
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {comment.content}
                    </p>
                  </div>
                  <div className="flex items-center mt-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button className="text-xs text-gray-500 hover:text-primary">
                      Like
                    </button>
                    <span className="mx-1 text-gray-300">•</span>
                    <button className="text-xs text-gray-500 hover:text-primary">
                      Reply
                    </button>
                    <span className="mx-1 text-gray-300">•</span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {comments.length > 2 && (
              <button
                className="text-sm font-medium text-primary hover:text-primary/80 mb-4 transition-colors duration-200"
                onClick={() => setShowAllComments(!showAllComments)}
              >
                {showAllComments
                  ? "Show fewer comments"
                  : `View all ${comments.length} comments`}
              </button>
            )}

            <form
              onSubmit={handleAddComment}
              className="flex items-center mt-2"
            >
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarImage
                  src={user?.profilePicture || ""}
                  alt={user?.displayName || user?.username || ""}
                />
                <AvatarFallback className="bg-primary text-white">
                  {user?.displayName?.charAt(0) ||
                    user?.username?.charAt(0) ||
                    "?"}
                </AvatarFallback>
              </Avatar>
              <div className="ml-2 flex-1 relative">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white text-sm text-gray-900 dark:text-gray-100 pr-16 transition-all duration-200"
                  style={{ color: "black", backgroundColor: "white" }}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={handleAISuggestion}
                    disabled={isAISuggesting}
                    className="text-purple-400 hover:text-purple-600 p-1 rounded-full transition-colors disabled:opacity-50"
                    title="AI Suggest Reply"
                  >
                    {isAISuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-primary p-1 rounded-full"
                  >
                    <Smile className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="ml-2 text-primary hover:bg-primary/5"
                disabled={!newComment.trim() || addCommentMutation.isPending}
              >
                Post
              </Button>
            </form>
          </div>
        )}

        {/* Empty comments section - just the form */}
        {comments.length === 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <form onSubmit={handleAddComment} className="flex items-center">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarImage
                  src={user?.profilePicture || ""}
                  alt={user?.displayName || user?.username || ""}
                />
                <AvatarFallback className="bg-primary text-white">
                  {user?.displayName?.charAt(0) ||
                    user?.username?.charAt(0) ||
                    "?"}
                </AvatarFallback>
              </Avatar>
              <div className="ml-2 flex-1 relative">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white text-sm text-gray-900 dark:text-gray-100 pr-16 transition-all duration-200"
                  style={{ color: "black", backgroundColor: "white" }}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={handleAISuggestion}
                    disabled={isAISuggesting}
                    className="text-purple-400 hover:text-purple-600 p-1 rounded-full transition-colors disabled:opacity-50"
                    title="AI Suggest Reply"
                  >
                    {isAISuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-primary p-1 rounded-full"
                  >
                    <Smile className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="ml-2 text-primary hover:bg-primary/5"
                disabled={!newComment.trim() || addCommentMutation.isPending}
              >
                Post
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* ===== Edit Post Dialog ===== */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <textarea
              className="w-full min-h-[120px] px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none text-gray-900"
              placeholder="What's on your mind?"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />

            {/* Image preview / management */}
            {editImageUrl && (
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <img
                  src={editImageUrl}
                  alt="Post"
                  className="w-full h-auto max-h-60 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setEditImageUrl(null)}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Add/Change image button */}
            <div className="flex items-center gap-2">
              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleEditImageUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => editFileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="flex items-center gap-2"
              >
                <ImagePlus className="h-4 w-4" />
                {isUploadingImage
                  ? "Uploading..."
                  : editImageUrl
                  ? "Change Image"
                  : "Add Image"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!editContent.trim() || editPostMutation.isPending}
            >
              {editPostMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Delete Confirmation Dialog ===== */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone. All comments and reactions will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePostMutation.mutate()}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
