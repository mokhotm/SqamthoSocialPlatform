import { useState, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { PenLine, MapPin, Loader2, Sparkles } from 'lucide-react';

type UserProfile = {
  id: number;
  displayName: string;
  username: string;
  bio?: string;
  location?: string;
  profilePicture?: string;
  coverImage?: string;
  gender?: string;
  ethnicity?: string;
  dateOfBirth?: string | Date;
};

const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: "Display name must be at least 2 characters.",
  }),
  bio: z.string().optional(),
  location: z.string().optional(),
  gender: z.string().optional(),
  ethnicity: z.string().optional(),
  dateOfBirth: z.string().optional(), // Store as string from date input
  profilePicture: z.string().optional().or(z.literal('')),
  coverImage: z.string().optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileEditForm({ 
  user, 
  onSuccess,
  onCancel 
}: { 
  user: UserProfile;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  // State for file previews
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(user.profilePicture || '/uploads/default-avatar.png');
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(user.coverImage || null);

  // State for actual file objects (not part of react-hook-form's direct state for this schema)
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user.displayName || '',
      bio: user.bio || '',
      location: user.location || '',
      gender: user.gender || '',
      ethnicity: user.ethnicity || '',
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      profilePicture: user.profilePicture || '', 
      coverImage: user.coverImage || '',
    },
  });

  const handleAIBioHelp = async () => {
    try {
      setIsAILoading(true);
      const keywords = form.getValues('displayName') || user.username;
      const response = await apiRequest('POST', '/api/ai/generate-bio', { keywords });

      if (!response.ok) throw new Error('Failed to generate bio');
      
      const data = await response.json();
      form.setValue('bio', data.bio);
      
      toast({
        title: "AI Help",
        description: "Your bio has been updated with an AI suggestion.",
      });
    } catch (error) {
      toast({
        title: "AI Error",
        description: "Failed to generate bio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAILoading(false);
    }
  };

  const handleAutoLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Error",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Use OpenStreetMap Nominatim for free reverse geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
            );
            const data = await response.json();
            
            if (data.address) {
              const city = data.address.city || data.address.town || data.address.village || data.address.suburb || "";
              const country = data.address.country || "";
              const locationStr = [country, city].filter(Boolean).join(", ");
              form.setValue('location', locationStr);
              
              toast({
                title: "Location detected",
                description: `We've set your location to ${locationStr}.`,
              });
            } else {
              form.setValue('location', `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
          } catch (err) {
            form.setValue('location', `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          } finally {
            setIsLocationLoading(false);
          }
        },
        (error) => {
          setIsLocationLoading(false);
          toast({
            title: "Geolocation Error",
            description: "Unable to retrieve your location.",
            variant: "destructive",
          });
        }
      );
    } catch (error) {
      setIsLocationLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsLoading(true);
      console.log('Starting profile update with data:', data);
      
      // Create a copy of the data for updates
      const updateData = { ...data };
      
      // Handle file uploads first if files were selected
      if (profilePictureFile) {
        console.log('Uploading profile picture:', profilePictureFile.name);
        const formData = new FormData();
        formData.append('file', profilePictureFile);
        
        try {
          console.log('Making profile picture upload request...');
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
            credentials: 'include',
          });
          
          console.log('Profile picture upload response status:', uploadResponse.status);
          
          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('Profile picture upload failed:', errorText);
            throw new Error(`Failed to upload profile picture: ${errorText}`);
          }
          
          // Try to parse the JSON response
          let uploadResult;
          try {
            const responseText = await uploadResponse.text();
            console.log('Upload response text:', responseText);
            uploadResult = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse upload response:', parseError);
            throw new Error('Invalid upload response');
          }
          
          console.log('Profile picture upload result:', uploadResult);
          // Update the profilePicture field with the uploaded file URL
          if (uploadResult && uploadResult.filePath) {
            updateData.profilePicture = uploadResult.filePath;
          } else {
            console.error('Missing filePath in upload response');
            throw new Error('Server did not return file path');
          }
        } catch (uploadError) {
          console.error('Profile picture upload error:', uploadError);
          throw uploadError;
        }
      }
      
      if (coverImageFile) {
        console.log('Uploading cover image:', coverImageFile.name);
        const formData = new FormData();
        formData.append('file', coverImageFile);
        
        try {
          console.log('Making cover image upload request...');
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
            credentials: 'include',
          });
          
          console.log('Cover image upload response status:', uploadResponse.status);
          
          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('Cover image upload failed:', errorText);
            throw new Error(`Failed to upload cover image: ${errorText}`);
          }
          
          // Try to parse the JSON response
          let uploadResult;
          try {
            const responseText = await uploadResponse.text();
            console.log('Upload response text:', responseText);
            uploadResult = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse upload response:', parseError);
            throw new Error('Invalid upload response');
          }
          
          console.log('Cover image upload result:', uploadResult);
          // Update the coverImage field with the uploaded file URL
          if (uploadResult && uploadResult.filePath) {
            updateData.coverImage = uploadResult.filePath;
          } else {
            console.error('Missing filePath in upload response');
            throw new Error('Server did not return file path');
          }
        } catch (uploadError) {
          console.error('Cover image upload error:', uploadError);
          throw uploadError;
        }
      }
      
      // Filter out empty strings to avoid setting them as values
      const filteredUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== '')
      );
      
      console.log('Sending profile update with data:', filteredUpdateData);

      // Now update the profile with the file URLs included
      try {
        const response = await apiRequest('PUT', '/api/profile', filteredUpdateData);
        
        console.log('Profile update response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Profile update failed:', errorText);
          throw new Error(errorText || 'Failed to update profile');
        }
        
        // Consume the response body
        const result = await response.json();
        console.log('Profile update successful:', result);
      } catch (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }
      
      // Update the user in the auth context
      await refreshUser();
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Display Name
          </label>
          <Input
            id="displayName"
            placeholder="Your name"
            {...form.register('displayName')}
            disabled={isLoading}
          />
          {form.formState.errors.displayName && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.displayName.message}
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bio
          </label>
          <div className="relative">
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              className="min-h-[100px] pr-10"
              {...form.register('bio')}
              disabled={isLoading || isAILoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10"
              onClick={handleAIBioHelp}
              disabled={isLoading || isAILoading}
              title="AI Assistance"
            >
              {isAILoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
          </div>
          {form.formState.errors.bio && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.bio.message}
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location
          </label>
          <div className="relative">
            <Input
              id="location"
              placeholder="Where are you from?"
              className="pr-10"
              {...form.register('location')}
              disabled={isLoading || isLocationLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={handleAutoLocation}
              disabled={isLoading || isLocationLoading}
              title="Auto-detect location"
            >
              {isLocationLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
            </Button>
          </div>
          {form.formState.errors.location && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.location.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Gender
            </label>
            <select
              id="gender"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...form.register('gender')}
              disabled={isLoading}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label htmlFor="ethnicity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ethnicity
            </label>
            <Input
              id="ethnicity"
              placeholder="e.g. Black, White, Indian..."
              {...form.register('ethnicity')}
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date of Birth
          </label>
          <Input
            id="dateOfBirth"
            type="date"
            {...form.register('dateOfBirth')}
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="profilePictureFile" className="block text-sm font-medium text-foreground mb-1">
            Profile Picture
          </label>
          {profilePicturePreview && (
            <div className="mt-2 mb-2 w-24 h-24 rounded-full overflow-hidden">
              <img src={profilePicturePreview} alt="Profile Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Input
              id="profilePictureFile"
              type="file"
              accept="image/*"
              className="sr-only" // Visually hide the default input
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                setProfilePictureFile(file);
                setProfilePicturePreview(URL.createObjectURL(file));
                form.setValue('profilePicture', ''); // Clear old URL, new one will come from upload
              } else {
                setProfilePictureFile(null);
                setProfilePicturePreview(user.profilePicture || null); // Revert to original if selection cleared
                form.setValue('profilePicture', user.profilePicture || '');
              }
            }}
            disabled={isLoading}
          />
            <label 
              htmlFor="profilePictureFile"
              className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Choose File
            </label>
            <span className="text-sm text-muted-foreground">
              {profilePictureFile ? profilePictureFile.name : (user.profilePicture ? "Current image set" : "No file chosen")}
            </span>
          </div> {/* This closes the div started in the previous chunk */}
           {/* Hidden input to carry the URL for react-hook-form, populated after upload */}
          <input type="hidden" {...form.register('profilePicture')} />
          {form.formState.errors.profilePicture && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.profilePicture.message}
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="coverImageFile" className="block text-sm font-medium text-foreground mb-1">
            Cover Image
          </label>
          {coverImagePreview && (
            <div className="mt-2 mb-2 w-full h-32 rounded-md overflow-hidden">
              <img src={coverImagePreview} alt="Cover Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Input
              id="coverImageFile"
              type="file"
              accept="image/*"
              className="sr-only" // Visually hide the default input
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                setCoverImageFile(file);
                setCoverImagePreview(URL.createObjectURL(file));
                form.setValue('coverImage', ''); // Clear old URL, new one will come from upload
              } else {
                setCoverImageFile(null);
                setCoverImagePreview(user.coverImage || null); // Revert to original if selection cleared
                form.setValue('coverImage', user.coverImage || '');
              }
            }}
            disabled={isLoading}
          />
            <label 
              htmlFor="coverImageFile"
              className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Choose File
            </label>
            <span className="text-sm text-muted-foreground">
              {coverImageFile ? coverImageFile.name : (user.coverImage ? "Current image set" : "No file chosen")}
            </span>
          </div> {/* This closes the div started in the previous chunk */}
           {/* Hidden input to carry the URL for react-hook-form, populated after upload */}
          <input type="hidden" {...form.register('coverImage')} />
          {form.formState.errors.coverImage && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.coverImage.message}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
