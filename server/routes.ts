import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { setupAuth } from "./auth.js";
import WebSocket, { WebSocketServer } from "ws";
import friendsRouter from "./routes/friends.js";
import conversationsRouter from "./routes/conversations.js";
import { db } from "./db.js"; // Import db
import { users } from "../shared/schema.js"; // Import users
import {
  insertUserSchema,
  insertPostSchema, 
  insertCommentSchema, 
  insertReactionSchema,
  insertMessageSchema,
  insertStorySchema,
  insertGroupSchema,
  insertGroupMemberSchema,
  insertGroupMessageSchema,
  insertFriendSchema,
  insertFinancialRecordSchema,
  insertHealthRecordSchema,
  insertSubscriptionSchema,
  insertUserSettingsSchema,
} from "../shared/schema.js";
import { z } from "zod";

interface ClientConnection {
  userId: number;
  socket: WebSocket;
}

const clients: ClientConnection[] = [];

function setupWebSockets(server: Server) {
  // Use correct WebSocket server path and ensure proper CORS settings
  const wss = new WebSocketServer({ 
    server, 
    path: '/ws',
    // Allow all origins in development
    verifyClient: () => true
  });
  
  console.log('WebSocket server initialized at /ws');
  
  wss.on('connection', (socket, req) => {
    console.log('New WebSocket connection established');
    
    // Handle new connections
    socket.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('WebSocket message received:', data.type);
        
        // Handle authentication
        if (data.type === 'auth') {
          const userId = data.userId;
          if (userId) {
            // Store the connection with the user ID
            clients.push({ userId, socket });
            
            // Send acknowledgment
            socket.send(JSON.stringify({ type: 'auth_success' }));
            console.log(`User ${userId} authenticated via WebSocket`);
          }
        }
        
        // Handle chat messages
        if (data.type === 'chat_message' && data.message) {
          const { senderId, receiverId, content } = data.message;
          console.log(`Chat message from ${senderId} to ${receiverId}: ${content.substring(0, 20)}...`);
          
          // Save message to storage
          storage.createMessage({
            senderId,
            receiverId,
            content
          }).then(savedMessage => {
            // Find receiver's connections
            const receiverConnections = clients.filter(client => client.userId === receiverId);
            
            // Send the message to all receiver's connections
            receiverConnections.forEach(client => {
              if (client.socket.readyState === WebSocket.OPEN) {
                client.socket.send(JSON.stringify({
                  type: 'new_message',
                  message: savedMessage
                }));
              }
            });
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    // Send a welcome message for testing connection
    socket.send(JSON.stringify({ 
      type: 'welcome', 
      message: 'Connected to Sqamtho WebSocket server' 
    }));
    
    // Handle disconnections
    socket.on('close', () => {
      // Remove the closed connection
      const index = clients.findIndex(client => client.socket === socket);
      if (index !== -1) {
        clients.splice(index, 1);
        console.log('WebSocket connection closed, client removed');
      }
    });
    
    // Handle errors
    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Mount friends router
  // Middleware to ensure authentication for friend routes
  app.use('/api', (req, res, next) => {
    console.log(`Authentication middleware: isAuthenticated = ${req.isAuthenticated()}, user = ${req.user ? req.user.id : 'null'}`);
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
  }, friendsRouter); // Apply middleware directly before friendsRouter


  // Mount conversations router
  app.use('/api', conversationsRouter);

  // User Settings Routes
  app.get('/api/user-settings/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const settings = await storage.getUserSettings(userId);
      if (!settings) {
        res.status(404).json({ error: 'Settings not found' });
        return;
      }
      res.json(settings);
    } catch (error) {
      console.error('Error fetching user settings:', error);
      res.status(500).json({ error: 'Failed to fetch user settings' });
    }
  });

  app.post('/api/user-settings', async (req, res) => {
    try {
      const settings = insertUserSettingsSchema.parse(req.body);
      const newSettings = await storage.createUserSettings(settings);
      res.json(newSettings);
    } catch (error) {
      console.error('Error creating user settings:', error);
      res.status(400).json({ error: 'Invalid user settings data' });
    }
  });

  app.put('/api/user-settings/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const settings = insertUserSettingsSchema.partial().parse(req.body);
      const updatedSettings = await storage.updateUserSettings(userId, settings);
      if (!updatedSettings) {
        res.status(404).json({ error: 'Settings not found' });
        return;
      }
      res.json(updatedSettings);
    } catch (error) {
      console.error('Error updating user settings:', error);
      res.status(400).json({ error: 'Invalid user settings data' });
    }
  });

  // Financial Records Routes
  app.post('/api/financial-records', async (req, res) => {
    try {
      const record = insertFinancialRecordSchema.parse(req.body);
      const newRecord = await storage.createFinancialRecord(record);
      res.json(newRecord);
    } catch (error) {
      res.status(400).json({ error: 'Invalid financial record data' });
    }
  });

  app.get('/api/financial-records/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    const records = await storage.getFinancialRecords(userId);
    res.json(records);
  });

  app.get('/api/financial-records/:userId/:category', async (req, res) => {
    const userId = parseInt(req.params.userId);
    const category = req.params.category;
    const records = await storage.getFinancialRecordsByCategory(userId, category);
    res.json(records);
  });

  app.put('/api/financial-records/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const record = insertFinancialRecordSchema.partial().parse(req.body);
      const updatedRecord = await storage.updateFinancialRecord(id, record);
      res.json(updatedRecord);
    } catch (error) {
      res.status(400).json({ error: 'Invalid financial record data' });
    }
  });

  app.delete('/api/financial-records/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteFinancialRecord(id);
    res.status(204).send();
  });

  // Subscription routes
  app.post("/api/subscriptions", async (req, res) => {
    try {
      const record = insertSubscriptionSchema.parse(req.body);
      const newRecord = await storage.createSubscription(record);
      res.json(newRecord);
    } catch (error) {
      res.status(400).json({ error: "Invalid subscription data" });
    }
  });

  app.get("/api/subscriptions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const records = await storage.getSubscriptions(userId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
  });

  app.get("/api/subscriptions/:userId/active", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const records = await storage.getActiveSubscriptions(userId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active subscriptions" });
    }
  });

  app.get("/api/subscriptions/:userId/category/:category", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { category } = req.params;
      const records = await storage.getSubscriptionsByCategory(userId, category);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscriptions by category" });
    }
  });

  app.get("/api/subscriptions/:userId/upcoming/:days", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const days = parseInt(req.params.days);
      const records = await storage.getUpcomingRenewals(userId, days);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch upcoming renewals" });
    }
  });

  app.put("/api/subscriptions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const record = req.body;
      const updatedRecord = await storage.updateSubscription(id, record);
      res.json(updatedRecord);
    } catch (error) {
      res.status(400).json({ error: "Invalid subscription data" });
    }
  });

  app.delete("/api/subscriptions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSubscription(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete subscription" });
    }
  });

  // Health Records Routes
  app.post("/api/health-records", async (req, res) => {
    try {
      const record = insertHealthRecordSchema.parse(req.body);
      const newRecord = await storage.createHealthRecord(record);
      res.json(newRecord);
    } catch (error) {
      res.status(400).json({ error: 'Invalid health record data' });
    }
  });

  app.get('/api/health-records/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    const records = await storage.getHealthRecords(userId);
    res.json(records);
  });

  app.get('/api/health-records/:userId/:type', async (req, res) => {
    const userId = parseInt(req.params.userId);
    const type = req.params.type;
    const records = await storage.getHealthRecordsByType(userId, type);
    res.json(records);
  });

  app.put('/api/health-records/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const record = insertHealthRecordSchema.partial().parse(req.body);
      const updatedRecord = await storage.updateHealthRecord(id, record);
      res.json(updatedRecord);
    } catch (error) {
      res.status(400).json({ error: 'Invalid health record data' });
    }
  });

  app.delete('/api/health-records/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteHealthRecord(id);
    res.status(204).send();
  });

  // Existing routes...
  // Setup authentication
  setupAuth(app);
  
  // ===== Conversations API =====

  // Get all conversations for a user
  app.get("/api/conversations", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user.id;
      const conversations = await storage.getConversationsByUserId(userId);

      // Get messages and other participants for each conversation
      const conversationsWithDetails = await Promise.all(conversations.map(async (conversation) => {
        const messages = await storage.getMessagesByConversationId(conversation.id);
        const participants = await storage.getConversationParticipants(conversation.id);

        // Get user details for participants
        const participantsWithDetails = await Promise.all(participants.map(async (participant) => {
          const user = await storage.getUser(participant.userId);
          return user ? {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            profilePicture: user.profilePicture
          } : null;
        }));

        return {
          ...conversation,
          messages: messages.slice(-20), // Get last 20 messages
          participants: participantsWithDetails.filter(Boolean)
        };
      }));

      res.json(conversationsWithDetails);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Create a new conversation
  app.post("/api/conversations", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { participantIds } = req.body;
      const userId = req.user.id;

      // Validate participant IDs
      if (!Array.isArray(participantIds) || participantIds.length === 0) {
        return res.status(400).json({ message: "Invalid participant IDs" });
      }

      // Create conversation
      const conversation = await storage.createConversation({
        createdBy: userId,
        participantIds: [userId, ...participantIds]
      });

      res.status(201).json(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  // Get messages for a conversation
  app.get("/api/conversations/:conversationId/messages", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const conversationId = parseInt(req.params.conversationId);
      const messages = await storage.getMessagesByConversationId(conversationId);

      // Get user details for each message
      const messagesWithDetails = await Promise.all(messages.map(async (message) => {
        const user = await storage.getUser(message.userId);
        return {
          ...message,
          author: user ? {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            profilePicture: user.profilePicture
          } : null
        };
      }));

      res.json(messagesWithDetails);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send a message in a conversation
  app.post("/api/conversations/:conversationId/messages", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const conversationId = parseInt(req.params.conversationId);
      const userId = req.user.id;
      const { content } = req.body;

      const message = await storage.createMessage({
        conversationId,
        userId,
        content,
        timestamp: new Date()
      });

      const user = await storage.getUser(userId);
      const messageWithAuthor = {
        ...message,
        author: user ? {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          profilePicture: user.profilePicture
        } : null
      };

      // Notify other participants via WebSocket
      const participants = await storage.getConversationParticipants(conversationId);
      participants.forEach((participant) => {
        if (participant.userId !== userId) {
          const clientConnection = clients.find(client => client.userId === participant.userId);
          if (clientConnection) {
            clientConnection.socket.send(JSON.stringify({
              type: 'new_message',
              data: messageWithAuthor
            }));
          }
        }
      });

      res.status(201).json(messageWithAuthor);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSockets
  setupWebSockets(httpServer);
  
  // ===== Posts API =====
  
  // Get all posts
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getPosts();
      
      // For each post, get author, comments, and reactions
      const postsWithDetails = await Promise.all(posts.map(async (post) => {
        const author = await storage.getUser(post.userId);
        const comments = await storage.getCommentsByPostId(post.id);
        const reactions = await storage.getReactionsByPostId(post.id);
        
        // Get comment authors
        const commentsWithAuthor = await Promise.all(comments.map(async (comment) => {
          const commentAuthor = await storage.getUser(comment.userId);
          return {
            ...comment,
            author: commentAuthor ? {
              id: commentAuthor.id,
              username: commentAuthor.username,
              displayName: commentAuthor.displayName,
              profilePicture: commentAuthor.profilePicture
            } : null
          };
        }));
        
        return {
          ...post,
          author: author ? {
            id: author.id,
            username: author.username,
            displayName: author.displayName,
            profilePicture: author.profilePicture
          } : null,
          comments: commentsWithAuthor,
          reactions: {
            count: reactions.length,
            types: countReactionTypes(reactions)
          }
        };
      }));
      
      res.json(postsWithDetails);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });
  
  // Create a new post
  app.post("/api/posts", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const postData = insertPostSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const post = await storage.createPost(postData);
      
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });
  
  // Get a single post by ID
  app.get("/api/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const author = await storage.getUser(post.userId);
      const comments = await storage.getCommentsByPostId(post.id);
      const reactions = await storage.getReactionsByPostId(post.id);
      
      // Get comment authors
      const commentsWithAuthor = await Promise.all(comments.map(async (comment) => {
        const commentAuthor = await storage.getUser(comment.userId);
        return {
          ...comment,
          author: commentAuthor ? {
            id: commentAuthor.id,
            username: commentAuthor.username,
            displayName: commentAuthor.displayName,
            profilePicture: commentAuthor.profilePicture
          } : null
        };
      }));
      
      const postWithDetails = {
        ...post,
        author: author ? {
          id: author.id,
          username: author.username,
          displayName: author.displayName,
          profilePicture: author.profilePicture
        } : null,
        comments: commentsWithAuthor,
        reactions: {
          count: reactions.length,
          types: countReactionTypes(reactions)
        }
      };
      
      res.json(postWithDetails);
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });
  
  // ===== Comments API =====
  
  // Add a comment to a post
  app.post("/api/posts/:postId/comments", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const postId = parseInt(req.params.postId);
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const commentData = insertCommentSchema.parse({
        postId,
        userId: req.user.id,
        content: req.body.content
      });
      
      const comment = await storage.createComment(commentData);
      const author = await storage.getUser(comment.userId);
      
      const commentWithAuthor = {
        ...comment,
        author: author ? {
          id: author.id,
          username: author.username,
          displayName: author.displayName,
          profilePicture: author.profilePicture
        } : null
      };
      
      res.status(201).json(commentWithAuthor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add comment" });
    }
  });
  
  // Get comments for a post
  app.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getCommentsByPostId(postId);
      
      // Get comment authors
      const commentsWithAuthor = await Promise.all(comments.map(async (comment) => {
        const author = await storage.getUser(comment.userId);
        return {
          ...comment,
          author: author ? {
            id: author.id,
            username: author.username,
            displayName: author.displayName,
            profilePicture: author.profilePicture
          } : null
        };
      }));
      
      res.json(commentsWithAuthor);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });
  
  // ===== Reactions API =====
  
  // Add or update a reaction to a post
  app.post("/api/posts/:postId/reactions", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const postId = parseInt(req.params.postId);
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const reactionData = insertReactionSchema.parse({
        postId,
        userId: req.user.id,
        type: req.body.type
      });
      
      const reaction = await storage.createReaction(reactionData);
      
      res.status(201).json(reaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add reaction" });
    }
  });
  
  // Remove a reaction from a post
  app.delete("/api/posts/:postId/reactions", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const postId = parseInt(req.params.postId);
      
      await storage.removeReaction(req.user.id, postId);
      
      res.status(200).json({ message: "Reaction removed" });
    } catch (error) {
      console.error('Error removing reaction:', error);
      res.status(500).json({ message: "Failed to remove reaction" });
    }
  });
  
  // ===== Messages API =====
  
  // Get conversations for the authenticated user
  app.get("/api/conversations", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const conversations = await storage.getConversations(req.user.id);
      
      // Format the response
      const formattedConversations = conversations.map(conv => ({
        user: {
          id: conv.user.id,
          username: conv.user.username,
          displayName: conv.user.displayName,
          profilePicture: conv.user.profilePicture
        },
        lastMessage: {
          id: conv.lastMessage.id,
          content: conv.lastMessage.content,
          userId: conv.lastMessage.userId, // Corrected to userId
          read: conv.lastMessage.read,
          timestamp: conv.lastMessage.timestamp,
        },
        isOnline: isUserOnline(conv.user.id) // Check if user is connected to WebSocket
      }));
      
      res.json(formattedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });
  
  // Get messages between the authenticated user and another user
  app.get("/api/messages/:userId", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const otherUserId = parseInt(req.params.userId);
      const messages = await storage.getMessagesBetweenUsers(req.user.id, otherUserId);
      
      // Mark messages as read if the authenticated user is the receiver
      await Promise.all(messages.map(async (message) => {
        // Mark messages as read if the authenticated user is the receiver
        // Check if the message sender is not the current user and the message is unread
        if (message.userId !== req.user.id && !message.read) {
          await storage.markMessageAsRead(message.id);
        }
      }));
      
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  
  // Send a message
  app.post("/api/messages", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      // Construct message data to match InsertMessage schema
      const messageData = insertMessageSchema.parse({
        conversationId: req.params.conversationId, // Assuming conversationId is available in params
        userId: req.user.id, // Sender is the authenticated user
        content: req.body.content,
        // timestamp will be defaulted by the database
      });
      
      const message = await storage.createMessage(messageData);
      
      // Notify the receiver through WebSocket if online
      // Notify the receiver through WebSocket if online
      // Get receiver ID from request body
      const receiverId = req.body.receiverId;
      const receiverConnections = clients.filter(client => client.userId === receiverId);
      
      receiverConnections.forEach(client => {
        if (client.socket.readyState === WebSocket.OPEN) {
          client.socket.send(JSON.stringify({
            type: 'new_message',
            message
          }));
        }
      });
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  
  // ===== Friends API =====
  
  // Get friends for the authenticated user
  app.get("/api/friends", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const friendships = await storage.getFriendsByUserId(req.user.id);
      
      // Filter to only include accepted friendships
      const acceptedFriendships = friendships.filter(f => f.status === 'accepted');
      
      // Get the friend details
      const friendsWithDetails = await Promise.all(acceptedFriendships.map(async (friendship) => {
        const friendId = friendship.userId === req.user.id ? friendship.friendId : friendship.userId;
        const friend = await storage.getUser(friendId);
        
        return {
          id: friend?.id || 0,
          username: friend?.username || '',
          displayName: friend?.displayName || '',
          profilePicture: friend?.profilePicture,
          isOnline: friend ? isUserOnline(friend.id) : false
        };
      }));
      
      res.json(friendsWithDetails);
    } catch (error) {
      console.error('Error fetching friends:', error);
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });
  
  // Get friend requests for the authenticated user
  app.get("/api/friends/requests", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const friendships = await storage.getFriendsByUserId(req.user.id);
      
      // Filter to only include pending requests where the user is the receiver
      const pendingRequests = friendships.filter(f => 
        f.status === 'pending' && f.friendId === req.user.id
      );
      
      // Get the friend details
      const requestsWithDetails = await Promise.all(pendingRequests.map(async (friendship) => {
        const friend = await storage.getUser(friendship.userId);
        
        return {
          id: friend?.id || 0,
          username: friend?.username || '',
          displayName: friend?.displayName || '',
          profilePicture: friend?.profilePicture,
          isOnline: friend ? isUserOnline(friend.id) : false
        };
      }));
      
      res.json(requestsWithDetails);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      res.status(500).json({ message: "Failed to fetch friend requests" });
    }
  });
  
  // Get friend suggestions for the authenticated user
  app.get("/api/friends/suggestions", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      // Get all users
      const allUsers = await db.select().from(users);
      
      // Get current user's friends and pending requests
      const friendships = await storage.getFriendsByUserId(req.user.id);
      
      // Get IDs of users who are already friends or have pending requests
      const existingFriendIds = friendships.map(f => 
        f.userId === req.user.id ? f.friendId : f.userId
      );
      
      // Filter users to exclude current user and existing friends/requests
      const suggestions = allUsers.filter(user => 
        user.id !== req.user.id && !existingFriendIds.includes(user.id)
      ).slice(0, 10); // Limit to 10 suggestions
      
      // Format the response
      const formattedSuggestions = suggestions.map(user => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
        isOnline: isUserOnline(user.id)
      }));
      
      res.json(formattedSuggestions);
    } catch (error) {
      console.error('Error fetching friend suggestions:', error);
      res.status(500).json({ message: "Failed to fetch friend suggestions" });
    }
  });
  
  // Send a friend request
  app.post("/api/friends", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const friendId = req.body.friendId;
      
      // Check if the friend exists
      const friend = await storage.getUser(friendId);
      if (!friend) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if a friend request already exists
      const existingRequest = await storage.getFriendRequestByUsers(req.user.id, friendId);
      if (existingRequest) {
        return res.status(409).json({ message: "Friend request already exists" });
      }
      
      // Create friend request
      const friendRequest = await storage.createFriendRequest({
        userId: req.user.id,
        friendId,
        status: 'pending'
      });
      
      res.status(201).json(friendRequest);
    } catch (error) {
      console.error('Error creating friend request:', error);
      res.status(500).json({ message: "Failed to send friend request" });
    }
  });
  
  // Accept or reject a friend request
  app.put("/api/friends/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const requestId = parseInt(req.params.id);
      const status = req.body.status;
      
      // Validate status
      if (status !== 'accepted' && status !== 'rejected') {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Check if the friend request exists
      const friendRequest = await storage.getFriendsByUserId(req.user.id)
        .then(friends => friends.find(f => f.id === requestId));
      
      if (!friendRequest) {
        return res.status(404).json({ message: "Friend request not found" });
      }
      
      // Check if the user is the receiver of the request
      if (friendRequest.friendId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this request" });
      }
      
      // Update the request status
      const updatedRequest = await storage.updateFriendStatus(requestId, status);
      
      res.json(updatedRequest);
    } catch (error) {
      console.error('Error updating friend request:', error);
      res.status(500).json({ message: "Failed to update friend request" });
    }
  });
  
  // Helper function to count reaction types
  function countReactionTypes(reactions: any[]) {
    const counts: Record<string, number> = {};
    
    reactions.forEach(reaction => {
      counts[reaction.type] = (counts[reaction.type] || 0) + 1;
    });
    
    return counts;
  }
  
  // Helper function to check if a user is online
  function isUserOnline(userId: number): boolean {
    return clients.some(client => client.userId === userId);
  }

  return httpServer;
}
