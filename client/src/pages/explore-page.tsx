import Layout from "@/components/layout";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

export default function ExplorePage() {


  return (
    <Layout>
          <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Explore</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Discover new content and communities</p>
          </div>

          <Card className="p-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Search posts, communities, or people..."
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
            {/* Placeholder for explore content */}
            <div className="grid gap-6 mt-6">
              <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Placeholder cards */}
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="p-4 hover:shadow-md transition-shadow">
                      <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-md mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Placeholder {i}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Content coming soon!
                      </p>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          </div>
          </div>
    </Layout>
  );
}
