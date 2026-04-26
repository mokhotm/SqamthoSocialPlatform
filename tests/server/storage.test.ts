// tests/server/storage.test.ts
import { storage } from '../../server/storage';
import { pool } from '../../server/db';

describe('Storage Layer', () => {
  beforeAll(async () => {
    // Set up test database state
    // You might want to use a test database or reset the state here
  });

  afterAll(async () => {
    // Clean up test database state
    await pool.end();
  });

  describe('User Operations', () => {
    it('should get user by ID', async () => {
      const user = await storage.getUser(1);

      expect(user).toBeDefined();
      expect(user?.id).toBe(1);
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('email');
    });

    it('should get user by username', async () => {
      const user = await storage.getUserByUsername('testuser');

      expect(user).toBeDefined();
      expect(user?.username).toBe('testuser');
    });

    it('should create a new user', async () => {
      const newUser = {
        username: `testuser${Date.now()}`,
        displayName: 'Test User',
        email: `test${Date.now()}@example.com`,
        password_hash: 'hashedpassword.salt',
        bio: 'Test bio',
        profilePicture: 'https://example.com/avatar.jpg',
        location: 'Test City'
      };

      const createdUser = await storage.createUser(newUser);

      expect(createdUser).toBeDefined();
      expect(createdUser.username).toBe(newUser.username);
      expect(createdUser.email).toBe(newUser.email);
    });

    it('should return undefined for non-existent user', async () => {
      const user = await storage.getUser(99999);

      expect(user).toBeUndefined();
    });
  });

  describe('Post Operations', () => {
    it('should create a new post', async () => {
      const newPost = {
        userId: 1,
        content: 'This is a test post',
        imageUrl: 'https://example.com/image.jpg'
      };

      const createdPost = await storage.createPost(newPost);

      expect(createdPost).toBeDefined();
      expect(createdPost.userId).toBe(newPost.userId);
      expect(createdPost.content).toBe(newPost.content);
    });

    it('should get posts by user ID', async () => {
      const posts = await storage.getPostsByUserId([1]);

      expect(Array.isArray(posts)).toBe(true);
    });

    it('should get all posts', async () => {
      const posts = await storage.getPosts();

      expect(Array.isArray(posts)).toBe(true);
    });
  });

  describe('Friend Operations', () => {
    it('should create a friend request', async () => {
      const friendRequest = {
        userId: 1,
        friendId: 2,
        status: 'pending'
      };

      const createdFriend = await storage.createFriendRequest(friendRequest);

      expect(createdFriend).toBeDefined();
      expect(createdFriend.userId).toBe(friendRequest.userId);
      expect(createdFriend.friendId).toBe(friendRequest.friendId);
      expect(createdFriend.status).toBe(friendRequest.status);
    });

    it('should get friends by user ID', async () => {
      const friends = await storage.getFriendsByUserId(1);

      expect(Array.isArray(friends)).toBe(true);
    });

    it('should update friend status', async () => {
      // First create a friend request
      const friendRequest = await storage.createFriendRequest({
        userId: 1,
        friendId: 3,
        status: 'pending'
      });

      const updatedFriend = await storage.updateFriendStatus(friendRequest.id, 'accepted');

      expect(updatedFriend.status).toBe('accepted');
    });
  });

  describe('Message Operations', () => {
    it('should create a new message', async () => {
      const newMessage = {
        conversationId: 1,
        userId: 1,
        senderId: 1,
        receiverId: 2,
        content: 'Test message'
      };

      const createdMessage = await storage.createMessage(newMessage);

      expect(createdMessage).toBeDefined();
      expect(createdMessage.content).toBe(newMessage.content);
    });

    it('should get messages between users', async () => {
      const messages = await storage.getMessagesBetweenUsers(1, 2);

      expect(Array.isArray(messages)).toBe(true);
    });
  });

  describe('Conversation Operations', () => {
    it('should create a new conversation', async () => {
      const conversationData = {
        createdBy: 1,
        participantIds: [1, 2]
      };

      const createdConversation = await storage.createConversation(conversationData);

      expect(createdConversation).toBeDefined();
      expect(createdConversation).toHaveProperty('id');
    });

    it('should get conversations by user ID', async () => {
      const conversations = await storage.getConversationsByUserId(1);

      expect(Array.isArray(conversations)).toBe(true);
    });

    it('should get conversation participants', async () => {
      const participants = await storage.getConversationParticipants(1);

      expect(Array.isArray(participants)).toBe(true);
    });
  });
});
