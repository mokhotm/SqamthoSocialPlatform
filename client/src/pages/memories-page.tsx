import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Share2, Heart, MessageCircle, Sparkles, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

function MemoryCard({ memory }: { memory: any }) {
  const memoryDate = new Date(memory.createdAt);
  const yearsAgo = new Date().getFullYear() - memoryDate.getFullYear();

  return (
    <Card className="overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {yearsAgo === 0 
                ? format(memoryDate, 'MMMM d') 
                : `${yearsAgo} ${yearsAgo === 1 ? 'year' : 'years'} ago`}
            </span>
          </div>
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-gray-900 dark:text-gray-100 mb-4">{memory.content}</p>
        {memory.imageUrl && (
          <div className="rounded-lg overflow-hidden mb-4">
            <img src={memory.imageUrl} alt="Memory" className="w-full" />
          </div>
        )}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary">
            <Heart className="h-4 w-4 mr-1" />
            {memory.likes || 0}
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary">
            <MessageCircle className="h-4 w-4 mr-1" />
            {memory.comments?.length || 0}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function MemoriesPage() {
  const { user } = useAuth();

  const { data: memories = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/memories"],
    queryFn: getQueryFn({ on401: "returnNull" })
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Memories</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Relive your past moments</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {memories.length > 0 ? (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Sparkles className="h-5 w-5 text-primary mr-2" />
                  On This Day
                </h2>
                <div className="space-y-4">
                  {memories.map(memory => (
                    <MemoryCard key={memory.id} memory={memory} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No memories for today</h3>
                <p className="text-gray-500 max-w-xs mx-auto mt-2">
                  Check back tomorrow to see what you were up to on this day in previous years.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
