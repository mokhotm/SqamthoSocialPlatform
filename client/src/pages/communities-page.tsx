import Layout from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Users, Camera, Code, Coffee } from "lucide-react";

const FEATURED_COMMUNITIES = [
  {
    id: 'tech-hub',
    name: 'South African Tech Hub',
    description: 'A community for tech enthusiasts, developers, and innovators in South Africa',
    members: 3400,
    icon: Code,
    gradient: 'from-primary to-secondary'
  },
  {
    id: 'foodies',
    name: 'Johannesburg Foodies',
    description: 'Exploring the best food spots and sharing recipes in Joburg',
    members: 1200,
    icon: Coffee,
    gradient: 'from-accent to-primary'
  },
  {
    id: 'photography',
    name: 'Cape Town Photography',
    description: 'Capturing the beauty of Cape Town through photography',
    members: 824,
    icon: Camera,
    gradient: 'from-secondary to-accent'
  }
];

export default function CommunitiesPage() {


  return (
    <Layout>
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Communities</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Join communities that match your interests</p>
            </div>

            <Card className="p-4 mb-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Search communities..."
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </Card>

            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {FEATURED_COMMUNITIES.map((community) => (
                  <Card key={community.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className={`h-24 bg-gradient-to-br ${community.gradient} p-6 flex items-center justify-center rounded-md`}>
                      <community.icon className="h-12 w-12 text-white" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{community.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                        {community.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          {community.members.toLocaleString()} members
                        </div>
                        <Button size="sm">Join</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
    </Layout>
  );
}
