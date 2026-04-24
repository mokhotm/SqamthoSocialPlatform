import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Clock, Users, Plus, Search, Settings, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getQueryFn } from "@/lib/queryClient";
import { Event } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import Layout from "@/components/layout";
import { format } from "date-fns";

function EventCard({ event }: { event: Event }) {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="aspect-[2/1] overflow-hidden relative">
        <img 
          src={event.imageUrl || "/placeholder-event.jpg"} 
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-semibold text-white mb-1 line-clamp-1">{event.title}</h3>
          <div className="flex items-center text-white/90 text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{format(new Date(event.startDate), "MMM d, yyyy")}</span>
            <Clock className="h-4 w-4 ml-3 mr-1" />
            <span>{format(new Date(event.startDate), "h:mm a")}</span>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            <span>{event.attendeeCount} attending</span>
          </div>
        </div>
        <Button className="w-full group-hover:bg-primary transition-colors">
          View Details
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
}

function CreateEventButton() {
  return (
    <Button 
      size="lg"
      className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <Plus className="h-5 w-5 mr-2" />
      Create New Event
    </Button>
  );
}

function EventsPage() {
  const { } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    queryFn: getQueryFn({ on401: "returnNull" })
  });

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (event.location?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Events
                </h1>
                <p className="text-muted-foreground mt-1">Discover and join upcoming events</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search events..." 
                    className="pl-9 w-full sm:w-[300px] bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Create Event Button - Top */}
            <CreateEventButton />

            {/* Events Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-1">
                    {searchQuery ? 'No events found' : 'No events yet'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery 
                      ? 'Try adjusting your search query'
                      : 'Create your first event to get started'}
                  </p>
                </div>
              )}
            </div>
          </div>
    </Layout>
  );
}

export default EventsPage;
