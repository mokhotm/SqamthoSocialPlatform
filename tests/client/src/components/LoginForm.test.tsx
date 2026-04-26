// tests/client/src/components/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from '../../../client/src/components/LoginForm';

// Mock the useAuth hook
jest.mock('../../../client/src/hooks/use-auth', () => ({
  useAuth: () => ({
    login: jest.fn(),
    isLoading: false,
    error: null
  })
}));

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

describe('LoginForm Component', () => {
  it('should render login form correctly', () => {
    render(<LoginForm />, { wrapper: createWrapper() });

    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    const mockLogin = jest.fn();
    jest.mocked(require('../../../client/src/hooks/use-auth').useAuth).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null
    });

    render(<LoginForm />, { wrapper: createWrapper() });

    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
    });
  });

  it('should disable form during loading', () => {
    jest.mocked(require('../../../client/src/hooks/use-auth').useAuth).mockReturnValue({
      login: jest.fn(),
      isLoading: true,
      error: null
    });

    render(<LoginForm />, { wrapper: createWrapper() });

    expect(screen.getByPlaceholderText('Username')).toBeDisabled();
    expect(screen.getByPlaceholderText('Password')).toBeDisabled();
    expect(screen.getByRole('button', { name: /login/i })).toBeDisabled();
  });

  it('should display error message', () => {
    const errorMessage = 'Invalid credentials';
    jest.mocked(require('../../../client/src/hooks/use-auth').useAuth).mockReturnValue({
      login: jest.fn(),
      isLoading: false,
      error: { message: errorMessage }
    });

    render(<LoginForm />, { wrapper: createWrapper() });

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
