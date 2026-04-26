import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const familyMemberSchema = z.object({
  friendId: z.string().min(1, "Picking a person is required"),
  relationship: z.string().min(1, "Relationship is required"),
  birthYear: z.string().optional(),
  isDeceased: z.boolean().default(false),
  deathYear: z.string().optional(),
  profilePicture: z.string().optional(),
});

type FamilyMemberFormValues = z.infer<typeof familyMemberSchema>;

interface Friend {
  id: number;
  username: string;
  displayName: string;
  profilePicture?: string;
}

interface FamilyMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FamilyMemberFormValues) => void;
  friends: Friend[];
  title?: string;
  initialData?: Partial<FamilyMemberFormValues>;
}

export function FamilyMemberDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  friends = [],
  title = "Add Family Member",
  initialData 
}: FamilyMemberDialogProps) {
  const form = useForm<FamilyMemberFormValues>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: {
      friendId: initialData?.friendId || "",
      relationship: initialData?.relationship || "",
      birthYear: initialData?.birthYear || "",
      isDeceased: initialData?.isDeceased || false,
      deathYear: initialData?.deathYear || "",
      profilePicture: initialData?.profilePicture || "",
    },
  });

  const onSubmit = (data: FamilyMemberFormValues) => {
    onSave(data);
    onClose();
    form.reset();
  };

  const isDeceased = form.watch("isDeceased");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-lg border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="friendId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Friend</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/50 dark:bg-black/50">
                        <SelectValue placeholder="Select a friend" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {friends.map((friend) => (
                        <SelectItem key={friend.id} value={friend.id.toString()}>
                          {friend.displayName || friend.username} (@{friend.username})
                        </SelectItem>
                      ))}
                      {friends.length === 0 && (
                        <p className="p-2 text-xs text-muted-foreground text-center">No friends or pending requests found</p>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/50 dark:bg-black/50">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Father">Father</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Brother">Brother</SelectItem>
                      <SelectItem value="Sister">Sister</SelectItem>
                      <SelectItem value="Son">Son</SelectItem>
                      <SelectItem value="Daughter">Daughter</SelectItem>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Grandfather">Grandfather</SelectItem>
                      <SelectItem value="Grandmother">Grandmother</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="birthYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Year</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1990" {...field} className="bg-white/50 dark:bg-black/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isDeceased && (
                <FormField
                  control={form.control}
                  name="deathYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Death Year</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2020" {...field} className="bg-white/50 dark:bg-black/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="isDeceased"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-white/30 dark:bg-black/30 border-primary/10">
                  <div className="space-y-0.5">
                    <FormLabel>Deceased</FormLabel>
                    <p className="text-[10px] text-muted-foreground">Mark if this person has passed away</p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profilePicture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Picture URL (Optional Override)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} className="bg-white/50 dark:bg-black/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90">
                Save Member
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
