import React from "react";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, 
  Plus,
  MapPin,
  Store,
  Filter,
  Share2,
  ShoppingBag,
  Truck,
  Heart,
  Shirt,
  Home,
  Gift,
  Music,
  Book,
  Loader2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { MarketplaceItem } from "@shared/schema";

const CATEGORIES = [
  { name: 'All', icon: Store },
  { name: 'Fashion', icon: Shirt },
  { name: 'Home & Garden', icon: Home },
  { name: 'Gifts', icon: Gift },
  { name: 'Entertainment', icon: Music },
  { name: 'Books', icon: Book },
];

function ListingCard({ listing }: { listing: any }) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative">
        <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {listing.imageUrl ? (
            <img 
              src={listing.imageUrl || ''} 
              alt={listing.title} 
              className="object-cover w-full h-full"
            />
          ) : (
            <Store className="h-12 w-12 text-gray-400" />
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0 text-gray-500 hover:text-primary bg-white dark:bg-gray-800 rounded-full"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 flex-1">
        <h3 className="font-semibold text-lg mb-1">{listing.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
          {listing.description}
        </p>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {listing.location}
            </span>
          </div>
          <div>
            <span className="font-semibold">
              {listing.currency} {listing.price}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={listing.seller?.avatar || ''} />
              <AvatarFallback>{(listing.seller?.name || 'S')[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{listing.seller?.name || 'Seller'}</span>
              <div className="text-[10px] text-gray-500">
                {listing.delivery ? 'Delivery' : ''}
                {listing.delivery && listing.collection ? ' • ' : ''}
                {listing.collection ? 'Collection' : ''}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {listing.delivery && <Truck className="h-4 w-4 text-gray-400" />}
            {listing.collection && <ShoppingBag className="h-4 w-4 text-gray-400" />}
          </div>
        </div>
      </div>

      <div className="p-4 pt-0 flex gap-2">
        <Button className="flex-1">Contact Seller</Button>
        <Button variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

function MarketplacePage() {
  const { } = useAuth(); // Keep hook for authentication check

  // Filter states
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedLocation, setSelectedLocation] = React.useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = React.useState('all');
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const { data: listings = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/marketplace"],
    queryFn: getQueryFn({ on401: "returnNull" })
  });

  // Filter the listings based on all criteria
  const filteredListings = listings.filter(listing => {
    // Search query filter
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (listing.tags || []).some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    // Location filter
    const matchesLocation = selectedLocation === 'all' || 
                           listing.location.toLowerCase().includes(selectedLocation.toLowerCase());

    // Price range filter
    const matchesPriceRange = (() => {
      if (selectedPriceRange === 'all') return true;
      const [min, max] = selectedPriceRange.split('-').map(Number);
      if (selectedPriceRange === '500+') return listing.price >= 500;
      return listing.price >= min && listing.price <= (max || Infinity);
    })();

    // Category filter
    const matchesCategory = selectedCategory === 'All' || 
                           listing.category === selectedCategory;

    return matchesSearch && matchesLocation && matchesPriceRange && matchesCategory;
  });

  return (
    <Layout>
        <div className="space-y-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketplace</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Discover unique local goods and services
                </p>
              </div>
              <Button className="md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                List an Item
              </Button>
            </div>

            <Card className="p-4 mb-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-2 relative">
                  <Input
                    type="text"
                    placeholder="Search items..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="gauteng">Gauteng</SelectItem>
                    <SelectItem value="western cape">Western Cape</SelectItem>
                    <SelectItem value="kwazulu-natal">KwaZulu-Natal</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Price Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="0-100">R0 - R100</SelectItem>
                      <SelectItem value="100-500">R100 - R500</SelectItem>
                      <SelectItem value="500+">R500+</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedLocation('all');
                      setSelectedPriceRange('all');
                      setSelectedCategory('All');
                    }}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            <div className="flex overflow-x-auto pb-4 mb-6 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
              <div className="flex space-x-2">
                {CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.name}
                      variant={selectedCategory === category.name ? 'default' : 'outline'}
                      className="whitespace-nowrap"
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {category.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredListings.length > 0 ? (
                  filteredListings.map(listing => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No items found.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
    </Layout>
  );
}

export default MarketplacePage;
