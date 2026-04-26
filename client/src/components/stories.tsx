import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import CreateStoryModal from "./create-story-modal";

interface Story {
  id: number;
  user: {
    id: number;
    username: string;
    displayName: string;
    profilePicture: string | null;
  };
  imageUrl: string | null;
  content: string | null;
  createdAt: string;
}

interface StoriesProps {
  stories: Story[];
}

export default function Stories({ stories }: StoriesProps) {
  const { user } = useAuth();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Show story modal when clicked
  const openStoryModal = (story: Story) => {
    setSelectedStory(story);
    // Close the modal after 5 seconds
    setTimeout(() => {
      setSelectedStory(null);
    }, 5000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Stories</h2>
        <a href="#" className="text-primary text-sm">See all</a>
      </div>
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {/* Create story card */}
        <div 
          className="flex-shrink-0 w-24 h-40 rounded-lg bg-gray-200 relative overflow-hidden cursor-pointer group"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-primary/40 flex items-center justify-center transition-opacity group-hover:opacity-90">
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Plus className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 right-2 text-center">
            <p className="text-white text-xs font-medium">Create Story</p>
          </div>
        </div>
        
        {/* Story cards */}
        {stories.map((story) => (
          <div 
            key={story.id}
            className="flex-shrink-0 w-24 h-40 rounded-lg bg-gray-100 relative overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => openStoryModal(story)}
          >
            {story.imageUrl ? (
              <img src={story.imageUrl} alt="Story" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full p-2 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30">
                <p className="text-[10px] text-primary/80 text-center line-clamp-5">{story.content}</p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute top-2 left-2 h-7 w-7 rounded-full bg-primary border-2 border-white overflow-hidden shadow-sm">
              <Avatar className="h-full w-full">
                <AvatarImage src={story.user.profilePicture || undefined} alt={story.user.displayName} />
                <AvatarFallback className="bg-primary text-white text-[10px]">
                  {story.user.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-white text-[10px] font-medium truncate">{story.user.displayName.split(' ')[0]}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Create Story Modal */}
      <CreateStoryModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

      {/* Story viewing modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 transition-all" onClick={() => setSelectedStory(null)}>
          <div className="relative w-full max-w-lg h-full max-h-[90vh] flex flex-col items-center justify-center p-4">
            <div className="relative w-full aspect-[9/16] max-h-full rounded-xl overflow-hidden bg-gray-900 shadow-2xl">
              {selectedStory.imageUrl ? (
                <img 
                  src={selectedStory.imageUrl} 
                  alt="Story" 
                  className="w-full h-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div className="w-full h-full p-8 flex items-center justify-center text-white text-xl text-center bg-gradient-to-br from-primary/80 to-secondary/80">
                  {selectedStory.content}
                </div>
              )}
              
              <div className="absolute top-4 left-4 flex items-center">
                <Avatar className="h-10 w-10 border-2 border-white/50">
                  <AvatarImage src={selectedStory.user.profilePicture || undefined} alt={selectedStory.user.displayName} />
                  <AvatarFallback className="bg-primary text-white">
                    {selectedStory.user.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 text-white drop-shadow-md">
                  <p className="font-bold text-sm">{selectedStory.user.displayName}</p>
                  <p className="text-[10px] opacity-80">Recently shared</p>
                </div>
              </div>

              <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
                <div className="h-full bg-white animate-story-progress origin-left"></div>
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-8 right-8 text-white hover:bg-white/10 rounded-full"
              onClick={() => setSelectedStory(null)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes story-progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .animate-story-progress {
          animation: story-progress 5s linear forwards;
        }
      `}} />
    </div>
  );
}
