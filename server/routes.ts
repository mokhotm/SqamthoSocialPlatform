import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { sql, or } from "drizzle-orm";
import { setupAuth } from "./auth.js";
import { posts } from "../shared/schema.js";
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // For ES module __dirname equivalent
import WebSocket, { WebSocketServer } from "ws";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import friendsRouter from "./routes/friends.js";
import conversationsRouter from "./routes/conversations.js";
import { requireAuth, getAuthenticatedUserId } from "./middleware/session-auth.js";
import { db } from "./db.js";
import { users } from "../shared/schema.js";
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
  insertSavedPostSchema,
  insertMarketplaceItemSchema,
  insertEventSchema,
} from "../shared/schema.js";
import { z } from "zod";
import { generateBio, generatePostDraft, generateComment } from "./ai.js";


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
  
  // Add error handler for the WebSocket server
  wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
  });
  
  console.log('WebSocket server initialized at /ws');
  
  wss.on('connection', (socket, req) => {
    console.log('New WebSocket connection established');
    
    // Handle new connections
    socket.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('WebSocket message received:', data.type);
        
        // Handle authentication - support both 'auth' and 'authenticate' types
        if (data.type === 'auth' || data.type === 'authenticate') {
          const userId = data.userId || data.data?.userId;
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
          const { senderId, receiverId, content, conversationId } = data.message;
          console.log(`Chat message from ${senderId} to ${receiverId}: ${content.substring(0, 20)}...`);
          // Save message to storage with all required fields
          storage.createMessage({
            conversationId,
            userId: senderId,
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
  // Create HTTP server
  const httpServer = createServer(app);
  console.log('HTTP server created successfully');
  
  // Initialize WebSocket server
  setupWebSockets(httpServer);
  console.log('WebSocket server initialized on HTTP server');
  
  // Set up authentication
  setupAuth(app);

  // --- File Upload Setup using Multer ---
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created uploads directory at: ${uploadsDir}`);
  }

  const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage: multerStorage });

  // File Upload Endpoint
  // This endpoint expects a single file in a field named 'file'
  app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    // Construct the URL path for the client. Assumes 'uploads' is served statically.
    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ message: 'File uploaded successfully', filePath: fileUrl });
  });
  // --- End File Upload Setup ---

  // AI Bio Generation Endpoint
  app.post("/api/ai/generate-bio", requireAuth, async (req, res) => {
    console.log('[API] AI Bio Generation request received', req.body);
    try {
      const { keywords } = req.body;
      const user = await storage.getUser(getAuthenticatedUserId(req)!);
      
      const generatedBio = await generateBio(keywords, user?.displayName || user?.username);
      
      console.log('[API] AI Bio generated successfully');
      res.json({ bio: generatedBio });
    } catch (error) {
      console.error("[API] AI Bio Generation Error:", error);
      res.status(500).json({ message: "Failed to generate bio" });
    }
  });

  // AI Post Draft Generation Endpoint
  app.post("/api/ai/generate-post", requireAuth, async (req, res) => {
    console.log('[API] AI Post Draft request received', req.body);
    try {
      const { prompt, feeling, location } = req.body;
      
      const draft = await generatePostDraft(prompt, feeling, location);
      
      console.log('[API] AI Post Draft generated successfully');
      res.json({ content: draft });
    } catch (error) {
      console.error("[API] AI Post Draft Error:", error);
      res.status(500).json({ message: "Failed to generate post draft" });
    }
  });

  // AI Comment Suggestion Endpoint
  app.post("/api/ai/suggest-comment", requireAuth, async (req, res) => {
    console.log('[API] AI Comment Suggestion request received', req.body);
    try {
      const { postContent, tone } = req.body;
      
      const comment = await generateComment(postContent, tone);
      
      console.log('[API] AI Comment Suggestion generated successfully');
      res.json({ comment });
    } catch (error) {
      console.error("[API] AI Comment Suggestion Error:", error);
      res.status(500).json({ message: "Failed to generate comment suggestion" });
    }
  });

  // Update Profile API
  app.put("/api/profile", requireAuth, async (req, res) => {
    console.log('[API] Profile update request received', req.body);
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const updates = insertUserSchema.partial().parse(req.body);
      const updatedUser = await storage.updateUser(userId, updates);
      
      const { password_hash: _, ...userWithoutPassword } = updatedUser;
      console.log('[API] Profile updated successfully for user', userId);
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("[API] Profile update error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Mount friends router with consistent authentication middleware
  app.use('/api/friends', requireAuth, friendsRouter);

  // Mount conversations router (auth handled inside router - returns [] when not authenticated)
  app.use('/api/conversations', conversationsRouter);

  // Profile API
  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const rawUserId = req.params.userId;
      const authenticatedUserId = getAuthenticatedUserId(req);
      console.log(`[API] Profile request - Requested ID: ${rawUserId}, Authenticated User ID: ${authenticatedUserId || 'none'}`);
      
      const userId = parseInt(rawUserId);
      if (isNaN(userId)) {
        console.error(`[API] Invalid userId provided: ${rawUserId}`);
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        console.log(`[API] User not found for ID: ${userId}`);
        return res.status(404).json({ message: "User not found" });
      }

      console.log(`[API] Fetching data for profile: ${user.username} (ID: ${userId})`);

      // Fetch user's posts
      const allFetchedPosts = await storage.getPostsByUserId([userId]);
      
      // SECURITY: Strictly filter posts to ensure they actually belong to the requested user.
      // This is a safeguard against any potential issues in the storage layer that might return extra data.
      const posts = allFetchedPosts.filter(post => post.userId === userId);
      
      if (allFetchedPosts.length !== posts.length) {
        console.warn(`[SECURITY] Profile API: storage.getPostsByUserId([${userId}]) returned ${allFetchedPosts.length} posts, but only ${posts.length} belong to the user. Filtered out ${allFetchedPosts.length - posts.length} posts.`);
      }

      console.log(`[API] Found ${posts.length} verified posts for user ${userId}`);
      
      // Get full details for each post with error safety
      const postsWithDetails = await Promise.all(posts.map(async (post) => {
        try {
          const comments = await storage.getCommentsByPostId(post.id);
          const reactions = await storage.getReactionsByPostId(post.id);

          const commentsWithAuthor = await Promise.all(comments.map(async (comment) => {
            const commentAuthor = await storage.getUser(comment.userId);
            return {
              ...comment,
              author: commentAuthor ? {
                id: commentAuthor.id,
                username: commentAuthor.username,
                displayName: commentAuthor.displayName || commentAuthor.username,
                profilePicture: commentAuthor.profilePicture || ''
              } : null
            };
          }));

          return {
            ...post,
            author: {
              id: user.id,
              username: user.username,
              displayName: user.displayName || user.username,
              profilePicture: user.profilePicture || ''
            },
            comments: commentsWithAuthor,
            reactions: {
              count: reactions.length,
              types: countReactionTypes(reactions)
            }
          };
        } catch (postErr) {
          console.error(`[API] Error processing post ${post.id}:`, postErr);
          return null; // Filter these out below
        }
      }));

      // Fetch friends
      const friendships = await storage.getFriendsByUserId(userId);
      const acceptedFriendships = friendships.filter(f => f.status === 'accepted');
      
      const uniqueFriendIds = new Set<number>();
      const friendsWithDetails = [];
      
      for (const f of acceptedFriendships) {
        const friendId = f.userId === userId ? f.friendId : f.userId;
        if (!uniqueFriendIds.has(friendId)) {
          uniqueFriendIds.add(friendId);
          const friend = await storage.getUser(friendId);
          if (friend) {
            friendsWithDetails.push({
              id: friend.id,
              username: friend.username,
              displayName: friend.displayName || friend.username,
              profilePicture: friend.profilePicture || '',
              coverImage: friend.coverImage || '',
              bio: friend.bio || '',
              location: friend.location || '',
              gender: friend.gender || '',
              ethnicity: friend.ethnicity || '',
              dateOfBirth: friend.dateOfBirth || null,
              createdAt: friend.createdAt
            });
          }
        }
      }

      console.log(`[API] Returning profile data for ${user.username}. Posts: ${postsWithDetails.filter(Boolean).length}, Friends: ${friendsWithDetails.length}`);

      res.json({
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName || user.username,
          profilePicture: user.profilePicture || '',
          coverImage: user.coverImage || '',
          bio: user.bio || '',
          location: user.location || '',
          gender: user.gender || '',
          ethnicity: user.ethnicity || '',
          dateOfBirth: user.dateOfBirth || null,
          createdAt: user.createdAt
        },
        posts: postsWithDetails.filter(Boolean).sort((a, b) => {
          const dateA = a && a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b && b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        }),
        friends: friendsWithDetails
      });
    } catch (error) {
      console.error("[API] Profile API Critical Error:", error);
      // Ensure we return JSON, not HTML
      res.status(500).json({ 
        message: "Internal server error occurred while fetching profile",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

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

  app.post('/api/user-settings', requireAuth, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const settings = insertUserSettingsSchema.parse({ ...req.body, userId });
      const newSettings = await storage.createUserSettings(settings);
      res.json(newSettings);
    } catch (error) {
      console.error('Error creating user settings:', error);
      res.status(400).json({ error: 'Invalid user settings data' });
    }
  });

  app.put('/api/user-settings/:userId', requireAuth, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
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
  app.post('/api/financial-records', requireAuth, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const record = insertFinancialRecordSchema.parse({ ...req.body, userId });
      const newRecord = await storage.createFinancialRecord(record);
      res.json(newRecord);
    } catch (error) {
      res.status(400).json({ error: 'Invalid financial record data' });
    }
  });

  app.get('/api/financial-records/:userId', requireAuth, async (req, res) => {
    const userId = getAuthenticatedUserId(req);
    const records = await storage.getFinancialRecords(userId);
    res.json(records);
  });

  app.get('/api/financial-records/:userId/:category', requireAuth, async (req, res) => {
    const userId = getAuthenticatedUserId(req);
    const category = req.params.category;
    const records = await storage.getFinancialRecordsByCategory(userId, category);
    res.json(records);
  });

  app.put('/api/financial-records/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const record = insertFinancialRecordSchema.partial().parse(req.body);
      const updatedRecord = await storage.updateFinancialRecord(id, record);
      res.json(updatedRecord);
    } catch (error) {
      res.status(400).json({ error: 'Invalid financial record data' });
    }
  });

  app.delete('/api/financial-records/:id', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteFinancialRecord(id);
    res.status(204).send();
  });

  // Subscription routes
  app.post("/api/subscriptions", requireAuth, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const record = insertSubscriptionSchema.parse(req.body);
      const newRecord = await storage.createSubscription({ userId, ...record });
      res.json(newRecord);
    } catch (error) {
      res.status(400).json({ error: "Invalid subscription data" });
    }
  });

  app.get("/api/subscriptions/:userId", requireAuth, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const records = await storage.getSubscriptions(userId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
  });

  app.get("/api/subscriptions/:userId/active", requireAuth, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const records = await storage.getActiveSubscriptions(userId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active subscriptions" });
    }
  });

  app.get("/api/subscriptions/:userId/category/:category", requireAuth, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const { category } = req.params;
      const records = await storage.getSubscriptionsByCategory(userId, category);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscriptions by category" });
    }
  });

  app.get("/api/subscriptions/:userId/upcoming/:days", requireAuth, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const days = parseInt(req.params.days);
      const records = await storage.getUpcomingRenewals(userId, days);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch upcoming renewals" });
    }
  });

  app.put("/api/subscriptions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const record = req.body;
      const updatedRecord = await storage.updateSubscription(id, record);
      res.json(updatedRecord);
    } catch (error) {
      res.status(400).json({ error: "Invalid subscription data" });
    }
  });

  app.delete("/api/subscriptions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSubscription(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete subscription" });
    }
  });

  // Health Records Routes
  app.post("/api/health-records", requireAuth, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const record = insertHealthRecordSchema.parse(req.body);
      // Pass record directly to match schema
      const newRecord = await storage.createHealthRecord(record);
      res.json(newRecord);
    } catch (error) {
      res.status(400).json({ error: 'Invalid health record data' });
    }
  });

  // Get all posts
  app.get("/api/posts", async (req, res) => {
    try {
      let postsToFetch;
      const filter = req.query.filter as string;

      if (filter === 'friends') {
        if (!req.isAuthenticated() || !req.user) {
          console.log('API /api/user: User not authenticated or req.user missing', {
            sessionID: req.sessionID,
            sessionUserId: (req.session as any)?.userId
          });
          return res.sendStatus(401);
        }
        
        console.log(`API /api/user: returning data for user ${req.user.id} (${req.user.username})`);
        const userId = getAuthenticatedUserId(req);
        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        const friends = await storage.getFriendsWithUsernamesByUserId(userId);
        const friendIds = friends.map(friend => friend.id);
        const friendUsernames = friends.map(friend => friend.username);

        // Fetch posts created by friends
        const postsByFriends = friendIds.length > 0
          ? await storage.getPostsByUserId(friendIds)
          : [];

        // Fetch posts that mention friends
        const mentionConditions = friendUsernames.map(username =>
          sql`${posts.content} LIKE ${'%' + '@' + username + '%'}`
        );

        const postsMentioningFriends = mentionConditions.length > 0
          ? await storage.getPostsByMention(or(...mentionConditions))
          : [];

        // Combine and remove duplicates
        const combinedPosts = [...postsByFriends, ...postsMentioningFriends];
        const uniquePosts = Array.from(new Map(combinedPosts.map(post => [post.id, post])).values());

        // Sort by creation date (most recent first)
        postsToFetch = uniquePosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      } else {
        // Default to fetching all posts if no filter or not authenticated
        postsToFetch = await storage.getPosts();
      }

      // For each post, get author, comments, and reactions
      const postsWithDetails = await Promise.all(postsToFetch.map(async (post) => {
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
  app.post("/api/posts", requireAuth, async (req: Request, res: Response) => {
    try {
      // Get user ID from session/passport
      const userId = getAuthenticatedUserId(req);
      
      console.log(`[API] POST /api/posts: Attempt from userId=${userId}`, {
        passportUser: req.user ? (req.user as any).id : 'null',
        sessionUserId: (req.session as any)?.userId || 'null',
        sessionID: req.sessionID
      });
      
      if (!userId) {
        console.error('[API] POST /api/posts: REJECTED - No user ID found in session');
        return res.status(401).json({ message: "Unauthorized - Please log in again" });
      }
      
      // Parse and validate the post data
      const postData = insertPostSchema.parse({
        ...req.body,
        userId: userId
      });
      
      console.log(`[API] Creating post for userId ${userId}:`, postData.content.substring(0, 30));
      
      // Create the post
      const post = await storage.createPost(postData);
      console.log(`[API] Post created successfully with ID ${post.id} for userId ${userId}`);
      
      // Get the full post with author details for the response
      const fullPost = await storage.getPostById(post.id);
      if (!fullPost) {
        throw new Error('Failed to retrieve created post');
      }
      
      // Get author details
      const author = await storage.getUser(userId);
      if (!author) {
        throw new Error('Author not found');
      }
      
      // Format the response to match the expected Post type
      const postWithAuthor = {
        ...fullPost,
        author: {
          id: author.id,
          username: author.username,
          displayName: author.displayName || author.username,
          profilePicture: author.profilePicture || ''
        },
        comments: [],
        reactions: {
          count: 0,
          types: {}
        }
      };
      
      // Invalidate the profile query to refresh the posts list
      // This will be handled by React Query's invalidation in the client
      
      res.status(201).json(postWithAuthor);
    } catch (error) {
      console.error('Error creating post:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid post data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ 
        message: "Failed to create post", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
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
  
  // Update a post (edit)
  app.patch("/api/posts/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const postId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const post = await storage.getPostById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (post.userId !== userId) {
        return res.status(403).json({ message: "You can only edit your own posts" });
      }

      const { content, imageUrl } = req.body;
      const updateData: { content?: string; imageUrl?: string | null } = {};
      if (content !== undefined) updateData.content = content;
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

      const updatedPost = await storage.updatePost(postId, updateData);

      // Return full post with author details
      const author = await storage.getUser(updatedPost.userId);
      const comments = await storage.getCommentsByPostId(updatedPost.id);
      const reactions = await storage.getReactionsByPostId(updatedPost.id);

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

      res.json({
        ...updatedPost,
        author: author ? {
          id: author.id,
          username: author.username,
          displayName: author.displayName || author.username,
          profilePicture: author.profilePicture || ''
        } : null,
        comments: commentsWithAuthor,
        reactions: {
          count: reactions.length,
          types: countReactionTypes(reactions)
        }
      });
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  // Delete a post
  app.delete("/api/posts/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const postId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const post = await storage.getPostById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (post.userId !== userId) {
        return res.status(403).json({ message: "You can only delete your own posts" });
      }

      await storage.deletePost(postId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // ===== Comments API =====
  
  // Add a comment to a post
  app.post("/api/posts/:postId/comments", async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
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
        userId: userId,
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
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
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
        userId: userId,
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
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const postId = parseInt(req.params.postId);
      
      await storage.removeReaction(userId, postId);
      
      res.status(200).json({ message: "Reaction removed" });
    } catch (error) {
      console.error('Error removing reaction:', error);
      res.status(500).json({ message: "Failed to remove reaction" });
    }
  });
  
  // ===== Messages API =====
  
  // Removed duplicate /api/conversations routes as they are handled by conversationsRouter
  
  // Get messages between the authenticated user and another user
  app.get("/api/messages/:userId", async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const otherUserId = parseInt(req.params.userId);
      const messages = await storage.getMessagesBetweenUsers(userId, otherUserId);
      
      // Mark messages as read if the authenticated user is the receiver
      await Promise.all(messages.map(async (message) => {
        // Mark messages as read if the authenticated user is the receiver
        // Check if the message sender is not the current user and the message is unread
        if (message.userId !== userId && !message.read) {
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
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      // Construct message data to match InsertMessage schema
      const messageData = insertMessageSchema.parse({
        conversationId: parseInt(req.body.conversationId, 10), // Get conversationId from body
        userId: userId, // User ID
        senderId: userId, // Sender is the authenticated user
        receiverId: parseInt(req.body.receiverId, 10), // Receiver ID from request body
        content: req.body.content,
        read: false // Initially unread
      });
      // Pass all required fields to createMessage
      const message = await storage.createMessage({
        conversationId: messageData.conversationId,
        userId: messageData.userId,
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
        content: messageData.content
      });
      
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
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const friendships = await storage.getFriendsByUserId(userId);
      
      // Filter to only include accepted friendships
      const acceptedFriendships = friendships.filter(f => f.status === 'accepted');
      
      // Get the friend details
      const friendsWithDetails = await Promise.all(acceptedFriendships.map(async (friendship) => {
        const friendId = friendship.userId === userId ? friendship.friendId : friendship.userId;
        const friend = await storage.getUser(friendId);
        
        return {
          id: friend?.id || 0,
          username: friend?.username || '',
          displayName: friend?.displayName || '',
          profilePicture: friend?.profilePicture,
          isOnline: friend ? isUserOnline(friend.id) : false
        };
      }));
      
      // Deduplicate by ID
      const uniqueFriends = Array.from(
        new Map(friendsWithDetails.filter(f => f.id !== 0).map(f => [f.id, f])).values()
      );
      
      res.json(uniqueFriends);
    } catch (error) {
      console.error('Error fetching friends:', error);
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });
  
  // Get friend requests for the authenticated user
  app.get("/api/friends/requests", async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const friendships = await storage.getFriendsByUserId(userId);
      
      // Filter to only include pending requests where the user is the receiver
      const pendingRequests = friendships.filter(f => 
        f.status === 'pending' && f.friendId === userId
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
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      // Get all users
      const allUsers = await storage.getUsers();
      
      // Get current user's friends and pending requests
      const friendships = await storage.getFriendsByUserId(userId);
      
      // Get IDs of users who are already friends or have pending requests
      const existingFriendIds = friendships.map(f => 
        f.userId === userId ? f.friendId : f.userId
      );
      
      // Filter users to exclude current user and existing friends/requests
      const suggestions = allUsers.filter(user => 
        user.id !== userId && !existingFriendIds.includes(user.id)
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
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
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
      const existingRequest = await storage.getFriendRequestByUsers(userId, friendId);
      if (existingRequest) {
        return res.status(409).json({ message: "Friend request already exists" });
      }
      
      // Create friend request
      const friendRequest = await storage.createFriendRequest({
        userId: userId,
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
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
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
      const friendRequest = await storage.getFriendsByUserId(userId)
        .then(friends => friends.find(f => f.id === requestId));
      
      if (!friendRequest) {
        return res.status(404).json({ message: "Friend request not found" });
      }
      
      // Check if the user is the receiver of the request
      if (friendRequest.friendId !== userId) {
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
  
  // ===== Saved Posts API =====
  app.get("/api/saved-posts", requireAuth, async (req, res) => {
    const userId = getAuthenticatedUserId(req);
    const saved = await storage.getSavedPosts(userId);
    res.json(saved);
  });

  app.post("/api/saved-posts", requireAuth, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const data = insertSavedPostSchema.parse({ ...req.body, userId });
      const saved = await storage.savePost(data);
      res.json(saved);
    } catch (error) {
      res.status(400).json({ error: "Invalid saved post data" });
    }
  });

  app.delete("/api/saved-posts/:postId", requireAuth, async (req, res) => {
    const userId = getAuthenticatedUserId(req);
    const postId = parseInt(req.params.postId);
    await storage.removeSavedPost(userId, postId);
    res.status(204).send();
  });

  // ===== Marketplace API =====
  app.get("/api/marketplace", async (req, res) => {
    const items = await storage.getMarketplaceItems();
    res.json(items);
  });

  app.post("/api/marketplace", requireAuth, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const data = insertMarketplaceItemSchema.parse({ ...req.body, userId });
      const item = await storage.createMarketplaceItem(data);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid marketplace item data" });
    }
  });

  app.delete("/api/marketplace/:id", requireAuth, async (req, res) => {
    const userId = getAuthenticatedUserId(req);
    const id = parseInt(req.params.id);
    const item = await storage.getMarketplaceItemById(id);
    if (!item || item.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await storage.deleteMarketplaceItem(id);
    res.status(204).send();
  });

  // ===== Groups API =====
  app.get("/api/groups", async (req, res) => {
    try {
      const type = req.query.type as string;
      const userId = getAuthenticatedUserId(req);

      if (type === 'joined' && userId) {
        const joinedGroups = await storage.getGroupsByUserId(userId);
        return res.json(joinedGroups);
      }

      const allGroups = await storage.getGroups();
      
      if (type === 'suggested' && userId) {
        const joinedGroups = await storage.getGroupsByUserId(userId);
        const joinedIds = new Set(joinedGroups.map(g => g.id));
        const suggestedGroups = allGroups.filter(g => !joinedIds.has(g.id));
        return res.json(suggestedGroups);
      }

      res.json(allGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      res.status(500).json({ error: "Failed to fetch groups" });
    }
  });

  app.post("/api/groups", requireAuth, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const data = insertGroupSchema.parse(req.body);
      const group = await storage.createGroup(data);
      
      // Add creator as admin
      await storage.addGroupMember({
        groupId: group.id,
        userId: userId,
        role: 'admin'
      });
      
      res.status(201).json(group);
    } catch (error) {
      console.error('Error creating group:', error);
      res.status(400).json({ error: "Invalid group data" });
    }
  });

  app.patch("/api/groups/:id", requireAuth, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const groupId = parseInt(req.params.id);
      
      // Check if user is admin
      const membership = await storage.getGroupMembershipByUser(userId!, groupId);
      if (!membership || membership.role !== 'admin') {
        return res.status(403).json({ error: "Only admins can update the group" });
      }

      const data = insertGroupSchema.partial().parse(req.body);
      const group = await storage.updateGroup(groupId, data);
      res.json(group);
    } catch (error) {
      console.error('Error updating group:', error);
      res.status(400).json({ error: "Invalid group data" });
    }
  });

  app.delete("/api/groups/:id", requireAuth, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const groupId = parseInt(req.params.id);
      
      // Check if user is admin
      const membership = await storage.getGroupMembershipByUser(userId!, groupId);
      if (!membership || membership.role !== 'admin') {
        return res.status(403).json({ error: "Only admins can delete the group" });
      }

      await storage.deleteGroup(groupId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting group:', error);
      res.status(500).json({ error: "Failed to delete group" });
    }
  });

  app.post("/api/groups/:id/join", requireAuth, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const groupId = parseInt(req.params.id);
      
      // Check if already a member
      const existing = await storage.getGroupMembershipByUser(userId!, groupId);
      if (existing) {
        return res.status(400).json({ error: "Already a member of this group" });
      }

      const membership = await storage.addGroupMember({
        groupId,
        userId: userId!,
        role: 'member'
      });
      res.status(201).json(membership);
    } catch (error) {
      console.error('Error joining group:', error);
      res.status(500).json({ error: "Failed to join group" });
    }
  });

  app.post("/api/groups/:id/leave", requireAuth, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const groupId = parseInt(req.params.id);
      
      await storage.removeGroupMember(groupId, userId!);
      res.status(204).send();
    } catch (error) {
      console.error('Error leaving group:', error);
      res.status(500).json({ error: "Failed to leave group" });
    }
  });

  app.get("/api/groups/memberships", requireAuth, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const memberships = await storage.getGroupMembershipsByUserId(userId);
      res.json(memberships);
    } catch (error) {
      console.error('Error fetching memberships:', error);
      res.status(500).json({ error: "Failed to fetch memberships" });
    }
  });

  // ===== Events API =====
  app.get("/api/events", async (req, res) => {
    const events = await storage.getEvents();
    res.json(events);
  });

  app.post("/api/events", requireAuth, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const data = insertEventSchema.parse({ ...req.body, creatorId: userId });
      const event = await storage.createEvent(data);
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: "Invalid event data" });
    }
  });

  // ===== Memories API =====
  app.get("/api/memories", requireAuth, async (req, res) => {
    const userId = getAuthenticatedUserId(req);
    const memories = await storage.getMemoriesOnThisDay(userId);
    res.json(memories);
  });

  // ===== Stories API =====
  app.get("/api/stories", requireAuth, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      
      const stories = await storage.getStoriesByFriends(userId);
      res.json(stories);
    } catch (error) {
      console.error('Error fetching stories:', error);
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  app.post("/api/stories", requireAuth, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const storyData = insertStorySchema.parse({
        ...req.body,
        userId,
        expiresAt
      });

      const story = await storage.createStory(storyData);
      
      // Return full story with author info
      const author = await storage.getUser(userId);
      res.status(201).json({
        ...story,
        user: author ? {
          id: author.id,
          username: author.username,
          displayName: author.displayName || author.username,
          profilePicture: author.profilePicture || ''
        } : null
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid story data", errors: error.errors });
      }
      console.error('Error creating story:', error);
      res.status(500).json({ message: "Failed to create story" });
    }
  });

  // ===== Explore API =====

  // ===== Trends API =====
  app.get("/api/trends", async (req, res) => {
    // In a real app, this would be computed from post content/hashtags
    // For now, we return data that can be managed on the server
    const trends = [
      { id: 1, name: "#Cricket", count: "15.5K posts", category: "Sports" },
      { id: 2, name: "#MzansiVibes", count: "9.2K posts", category: "Entertainment" },
      { id: 3, name: "#HeritageDay2023", count: "5.7K posts", category: "Culture" },
      { id: 4, name: "#Sqamtho", count: "3.1K posts", category: "Community" }
    ];
    res.json(trends);
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
