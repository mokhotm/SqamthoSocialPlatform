import { useState, useEffect } from 'react';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Subscription {
  id: number;
  userId: number;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  billingCycle: string;
  nextBillingDate: string;
  category: string;
  provider: string;
  status: 'active' | 'paused' | 'cancelled';
  autoRenew: boolean;
  reminderDays: number;
}

interface SubscriptionFormData {
  name: string;
  description: string;
  amount: number;
  currency: string;
  billingCycle: string;
  nextBillingDate: Date;
  category: string;
  provider: string;
  reminderDays: number;
}

const initialFormData: SubscriptionFormData = {
  name: '',
  description: '',
  amount: 0,
  currency: 'ZAR',
  billingCycle: 'monthly',
  nextBillingDate: new Date(),
  category: 'streaming',
  provider: '',
  reminderDays: 7,
};

const categories = [
  'streaming',
  'software',
  'utilities',
  'gaming',
  'music',
  'news',
  'fitness',
  'other',
];

const billingCycles = [
  'monthly',
  'quarterly',
  'yearly',
];

interface SubscriptionsPageProps {
  embedded?: boolean;
}

export default function SubscriptionsPage({ embedded = false }: SubscriptionsPageProps) {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<SubscriptionFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const userId = 1; // TODO: Get from auth context
      const response = await fetch(`/api/subscriptions/${userId}`);
      const data = await response.json();
      setSubscriptions(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch subscriptions',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const userId = 1; // TODO: Get from auth context
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId,
          nextBillingDate: formData.nextBillingDate.toISOString(),
          status: 'active',
          autoRenew: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to create subscription');

      setIsAddDialogOpen(false);
      setFormData(initialFormData);
      fetchSubscriptions();
      toast({
        title: 'Success',
        description: 'Subscription added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add subscription',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (id: number, status: 'active' | 'paused' | 'cancelled') => {
    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update subscription');

      fetchSubscriptions();
      toast({
        title: 'Success',
        description: 'Subscription updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update subscription',
        variant: 'destructive',
      });
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return sub.status === 'active';
    if (activeTab === 'paused') return sub.status === 'paused';
    if (activeTab === 'cancelled') return sub.status === 'cancelled';
    return true;
  });

  const totalMonthly = filteredSubscriptions
    .filter(sub => sub.status === 'active')
    .reduce((acc, sub) => {
      if (sub.billingCycle === 'monthly') return acc + sub.amount;
      if (sub.billingCycle === 'yearly') return acc + (sub.amount / 12);
      if (sub.billingCycle === 'quarterly') return acc + (sub.amount / 3);
      return acc;
    }, 0);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground">
            Monthly Total: {(totalMonthly / 100).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Subscription
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subscription</DialogTitle>
              <DialogDescription>
                Add a new subscription to track your recurring payments
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={e => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) * 100 }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    disabled
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={value => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="billingCycle">Billing Cycle</Label>
                  <Select
                    value={formData.billingCycle}
                    onValueChange={value => setFormData(prev => ({ ...prev, billingCycle: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {billingCycles.map(cycle => (
                        <SelectItem key={cycle} value={cycle}>
                          {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Next Billing Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.nextBillingDate ? (
                        format(formData.nextBillingDate, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.nextBillingDate}
                      onSelect={date => date && setFormData(prev => ({ ...prev, nextBillingDate: date }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Add Subscription</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className={embedded ? "" : "min-h-screen bg-gray-50 dark:bg-gray-900"}>
        {!embedded && <Header />}
        <div className={embedded ? "" : "container mx-auto px-4 pt-20"}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="paused">Paused</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredSubscriptions.map(subscription => (
                  <Card key={subscription.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {subscription.name}
                        <Badge variant={
                          subscription.status === 'active' ? 'default' :
                          subscription.status === 'paused' ? 'secondary' :
                          'destructive'
                        }>
                          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{subscription.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-medium">
                            {(subscription.amount / 100).toLocaleString('en-ZA', {
                              style: 'currency',
                              currency: subscription.currency
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Billing Cycle:</span>
                          <span className="font-medium">
                            {subscription.billingCycle.charAt(0).toUpperCase() + subscription.billingCycle.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Next Billing:</span>
                          <span className="font-medium">
                            {format(new Date(subscription.nextBillingDate), 'PP')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Category:</span>
                          <span className="font-medium">
                            {subscription.category.charAt(0).toUpperCase() + subscription.category.slice(1)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                      {subscription.status === 'active' && (
                        <Button
                          variant="secondary"
                          onClick={() => handleStatusChange(subscription.id, 'paused')}
                        >
                          Pause
                        </Button>
                      )}
                      {subscription.status === 'paused' && (
                        <Button
                          variant="secondary"
                          onClick={() => handleStatusChange(subscription.id, 'active')}
                        >
                          Resume
                        </Button>
                      )}
                      {subscription.status !== 'cancelled' && (
                        <Button
                          variant="destructive"
                          onClick={() => handleStatusChange(subscription.id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
