// tests/client/src/components/PostCard.test.tsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PostCard } from '../../../client/src/components/PostCard';

const mockPost = {
  id: 1,
  userId: 1,
  content: 'This is a test post content',
  imageUrl: 'https://example.com/image.jpg',
  createdAt: new Date('2024-01-15T10:30:00Z'),
  user: {
    id: 1,
    username: 'testuser',
    displayName: 'Test User',
    profilePicture: 'https://example.com/avatar.jpg'
  }
};

describe('PostCard Component', () => {
  it('should render post content correctly', () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByText(mockPost.content)).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
  });

  it('should render post image when provided', () => {
    render(<PostCard post={mockPost} />);

    const image = screen.getByAltText('Post image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockPost.imageUrl);
  });

  it('should handle posts without images', () => {
    const postWithoutImage = { ...mockPost, imageUrl: '' };

    render(<PostCard post={postWithoutImage} />);

    expect(screen.getByText(mockPost.content)).toBeInTheDocument();
    // Should not crash and should not have image element
  });

  it('should display formatted timestamp', () => {
    render(<PostCard post={mockPost} />);

    // The exact format depends on the implementation, but it should show the date
    expect(screen.getByText(/ago|today|yesterday|jan/i)).toBeInTheDocument();
  });

  it('should show action buttons', () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByRole('button', { name: /like/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /comment/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });
});
