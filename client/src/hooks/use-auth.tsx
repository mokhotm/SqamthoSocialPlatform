import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { LoginUserInput, RegisterUserInput, User } from "../../shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { toast } from "@/components/ui/use-toast";
import { API_CONFIG } from "@/lib/config";
import { setupWebSocket, closeWebSocket } from "@/lib/websocket";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginUserInput>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterUserInput>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Using the imported toast function directly
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: [API_CONFIG.ENDPOINTS.USER],
    queryFn: async () => {
      try {
        const response = await fetch(API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.USER), {
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            return null;
          }
          throw new Error('Failed to fetch user data');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
      }
    },
  });

  // Initialize WebSocket connection when user logs in
  useEffect(() => {
    let mounted = true;

    const initializeWebSocket = async () => {
      if (!mounted) return;

      if (user) {
        // Small delay to ensure proper cleanup of previous connection
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!mounted) return;

        console.log('Auth detected active user, setting up WebSocket for user ID:', user.id);
        setupWebSocket(user.id);
      } else {
        console.log('No authenticated user detected, closing WebSocket connection');
        closeWebSocket();
      }
    };

    initializeWebSocket();
    
    return () => {
      mounted = false;
      console.log('AuthProvider unmounting, cleaning up WebSocket');
      closeWebSocket();
    };
  }, [user?.id]);

  const loginMutation = useMutation<User, Error, LoginUserInput>({
    mutationFn: async (credentials: LoginUserInput) => {
      console.log('Attempting login with credentials:', { username: credentials.username });
      try {
        // Use centralized config for login endpoint
        const loginUrl = API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.LOGIN);
        console.log(`Making login request to: ${loginUrl}`);
        
        const res = await fetch(loginUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(credentials),
          credentials: 'include'
        });
        
        console.log('Received login response:', {
          status: res.status,
          statusText: res.statusText,
          headers: Object.fromEntries(res.headers.entries()),
          url: res.url
        });

        // Always try to parse the response body, whether it's an error or success
        const data = await res.json().catch(e => {
          console.error('Error parsing response body:', e);
          return null;
        });
        
        console.log('Response body:', data);

        if (!res.ok) {
          const errorMessage = data?.message || res.statusText || 'Login failed';
          console.error('Login failed:', {
            status: res.status,
            message: errorMessage,
            data
          });
          throw new Error(errorMessage);
        }

        if (!data) {
          throw new Error('No data received from server');
        }

        console.log('Login successful, user data:', data);
        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Login failed due to an unknown error';
        console.error('Login error details:', {
          error,
          message: errorMessage,
          stack: error instanceof Error ? error.stack : undefined
        });
        throw new Error(errorMessage);
      }
    },
    onSuccess: (user: SelectUser) => {
      console.log('Login successful for user:', user.username);
      queryClient.setQueryData(["/api/user"], user);
      setupWebSocket(user.id);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.displayName || user.username}!`,
      });
    },
    onError: (error: Error) => {
      // Error is guaranteed to be an Error object now
      console.error('Login mutation onError:', error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password", // Fallback just in case
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation<User, Error, RegisterUserInput>({
    mutationFn: async (userData: RegisterUserInput) => {
      const { confirmPassword, ...userDataWithoutConfirm } = userData;
      try {
        const res = await apiRequest("POST", "/api/register", userDataWithoutConfirm);
        return await res.json();
      } catch (error) {
        console.error('Caught error during registration API call:', error);
        // Ensure we always throw an Error object with a message
        if (error instanceof Error) {
          throw error;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
          throw new Error(String(error.message) || 'Registration failed due to unknown error');
        } else {
          throw new Error('Registration failed due to an unknown error');
        }
      }
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      setupWebSocket(user.id);
      toast({
        title: "Registration successful",
        description: `Welcome to Sqamtho, ${user.displayName || user.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      console.log('Attempting logout');
      try {
        await apiRequest("POST", "/api/logout");
      } catch (error) {
        console.error('Caught error during logout API call:', error);
        // Ensure we always throw an Error object with a message
        if (error instanceof Error) {
          throw error;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
          throw new Error(String(error.message) || 'Logout failed due to unknown error');
        } else {
          throw new Error('Logout failed due to an unknown error');
        }
      }
    },
    onSuccess: () => {
      console.log('Logout successful');
      queryClient.setQueryData(["/api/user"], null);
      closeWebSocket();
      toast({ title: "Logged out" });
    },
    onError: (error: Error) => {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout.",
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
