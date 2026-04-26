// tests/client/src/hooks/use-auth.test.tsx
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../../client/src/hooks/use-auth';

// Mock fetch
global.fetch = jest.fn();

// Test wrapper component
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeUndefined();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should login successfully with valid credentials', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        username: 'testuser',
        displayName: 'Test User'
      }),
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.login({
        username: 'testuser',
        password: 'password123'
      });
    });

    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        password: 'password123'
      }),
      credentials: 'include',
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({
      id: 1,
      username: 'testuser',
      displayName: 'Test User'
    });
  });

  it('should handle login failure', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Invalid credentials' }),
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.login({
          username: 'testuser',
          password: 'wrongpassword'
        });
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeUndefined();
  });

  it('should logout successfully', async () => {
    // First set up authenticated state
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        username: 'testuser',
        displayName: 'Test User'
      }),
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.login({
        username: 'testuser',
        password: 'password123'
      });
    });

    // Now test logout
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(fetch).toHaveBeenLastCalledWith('http://localhost:8000/api/logout', {
      method: 'POST',
      credentials: 'include',
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeUndefined();
  });
});
