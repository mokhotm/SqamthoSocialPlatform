// tests/client/src/components/FriendCard.test.tsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FriendCard } from '../../../client/src/components/FriendCard';

const mockFriend = {
  id: 1,
  username: 'testuser1',
  displayName: 'Test User 1',
  profilePicture: 'https://example.com/avatar1.jpg',
  location: 'Test City 1',
  bio: 'Test bio 1'
};

describe('FriendCard Component', () => {
  it('should render friend information correctly', () => {
    render(<FriendCard friend={mockFriend} />);

    expect(screen.getByText('Test User 1')).toBeInTheDocument();
    expect(screen.getByText('@testuser1')).toBeInTheDocument();
    expect(screen.getByText('Test City 1')).toBeInTheDocument();
    expect(screen.getByText('Test bio 1')).toBeInTheDocument();
    expect(screen.getByAltText('Test User 1')).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    render(<FriendCard friend={mockFriend} />);

    expect(screen.getByText('Message')).toBeInTheDocument();
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('should handle different friend statuses', () => {
    const pendingFriend = { ...mockFriend, status: 'pending' };

    render(<FriendCard friend={pendingFriend} />);

    expect(screen.getByText('Accept')).toBeInTheDocument();
    expect(screen.getByText('Decline')).toBeInTheDocument();
  });

  it('should handle missing profile picture', () => {
    const friendWithoutPicture = { ...mockFriend, profilePicture: '' };

    render(<FriendCard friend={friendWithoutPicture} />);

    // Should still render without crashing
    expect(screen.getByText('Test User 1')).toBeInTheDocument();
  });
});
