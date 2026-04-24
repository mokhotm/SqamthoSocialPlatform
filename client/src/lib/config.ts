// Central configuration file for application-wide settings
// This ensures all API URLs are consistent throughout the app

// Using Vite's environment variable system
export const API_CONFIG = {
  // Base URL for all API calls
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  
  // Helper function to get full URL for an endpoint
  getFullUrl: (endpoint: string): string => {
    const base = API_CONFIG.BASE_URL;
    // Ensure endpoint starts with a slash if combining with base URL
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  },
  
  // Common endpoints
  ENDPOINTS: {
    LOGIN: '/api/login',
    REGISTER: '/api/register',
    USER: '/api/user',
    FRIENDS: '/api/friends',
    FRIEND_REQUESTS: '/api/friend-requests',
    FRIEND_SUGGESTIONS: '/api/friend-suggestions',
  }
};
