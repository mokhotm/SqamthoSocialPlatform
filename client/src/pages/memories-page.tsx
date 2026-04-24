import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Share2, Heart, MessageCircle, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, subYears, subMonths, subDays } from "date-fns";

// Mock data - would come from API in real app
const MEMORIES = [
  {
    id: '1',
    type: 'post',
    date: subYears(new Date(), 1), // 1 year ago
    content: 'My first day at the new tech hub in Johannesburg! Excited to be part of this amazing community. 🚀 #TechLife #NewBeginnings',
    image: null,
    likes: 156,
    comments: 28,
    yearAgo: 1
  },
  {
    id: '2',
    type: 'milestone',
    date: subMonths(new Date(), 6), // 6 months ago
    content: 'Just hit 1000 connections on Sqamtho! Thank you all for being part of my journey. 🎉',
    image: null,
    yearAgo: 0,
    milestone: '1000 Connections'
  },
  {
    id: '3',
    type: 'post',
    date: subYears(new Date(), 2), // 2 years ago
    content: 'Beautiful sunset at Camps Bay. Cape Town, you never cease to amaze me! 🌅 #CapeTown #Sunset',
    image: null,
    likes: 423,
    comments: 45,
    yearAgo: 2
  },
  {
    id: '4',
    type: 'friendship',
    date: subYears(new Date(), 1), // 1 year ago
    content: 'Became friends with Thabo Mbeki and 5 others',
    yearAgo: 1,
    friends: [
      { name: 'Thabo Mbeki', username: 'thabom', avatar: null },
      { name: 'Siya Kolisi', username: 'siyak', avatar: null }
    ]
  }
];

function MemoryCard({ memory }: { memory: any }) {
  return (
    <Card className="overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {memory.yearAgo === 0 
                ? format(memory.date, 'MMMM d') 
                : `${memory.yearAgo} ${memory.yearAgo === 1 ? 'year' : 'years'} ago`}
            </span>
          </div>
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {memory.type === 'milestone' && (
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Achievement Unlocked!</h3>
              <p className="text-primary">{memory.milestone}</p>
            </div>
          </div>
        )}

        {memory.type === 'friendship' && (
          <div className="mb-4">
            <div className="flex -space-x-2">
              {memory.friends.map((friend: any) => (
                <Avatar key={friend.username} className="h-12 w-12 border-2 border-white dark:border-gray-900">
                  <AvatarImage src={friend.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {friend.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {memory.content}
            </p>
          </div>
        )}

        {memory.type === 'post' && (
          <>
            <p className="text-gray-900 dark:text-gray-100 mb-4">{memory.content}</p>
            {memory.image && (
              <div className="rounded-lg overflow-hidden mb-4">
                <img src={memory.image} alt="Memory" className="w-full" />
              </div>
            )}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary">
                <Heart className="h-4 w-4 mr-1" />
                {memory.likes}
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary">
                <MessageCircle className="h-4 w-4 mr-1" />
                {memory.comments}
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

export default function MemoriesPage() {
  const { user } = useAuth();


  const today = new Date();
  const onThisDay = MEMORIES.filter(memory => {
    const memoryDate = new Date(memory.date);
    return memoryDate.getDate() === today.getDate() && 
           memoryDate.getMonth() === today.getMonth();
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Memories</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Relive your past moments</p>
        </div>

        <div className="space-y-8">
          {onThisDay.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Sparkles className="h-5 w-5 text-primary mr-2" />
                On This Day
              </h2>
              <div className="space-y-4">
                {onThisDay.map(memory => (
                  <MemoryCard key={memory.id} memory={memory} />
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Past Memories</h2>
            <div className="space-y-4">
              {MEMORIES.filter(memory => !onThisDay.includes(memory)).map(memory => (
                <MemoryCard key={memory.id} memory={memory} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
