import {
  type User, type InsertUser,
  type Post, type InsertPost,
  type Comment, type InsertComment,
  type Reaction, type InsertReaction,
  type Message, type InsertMessage,
  type Story, type InsertStory,
  type Group, type InsertGroup,
  type GroupMember, type InsertGroupMember,
  type GroupMessage, type InsertGroupMessage,
  type Friend, type InsertFriend,
  type FinancialRecord, type InsertFinancialRecord,
  type HealthRecord, type InsertHealthRecord,
  type Subscription, type InsertSubscription,
  type UserSettings, type InsertUserSettings,
  users, posts, comments, reactions, messages, stories, groups, groupMembers, groupMessages, friends,
  financialRecords, healthRecords, subscriptions, userSettings,
  conversations, conversationParticipants
} from "../shared/schema.js";
import session from "express-session";
import createMemoryStore from "memorystore";
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

const { Pool } = pg;

const MemoryStore = createMemoryStore(session);

const databaseUrl = "postgresql://sqamtho:$qamth0%232025@localhost:5432/sqamthodb"; // URL-encoded '#' in password

console.log('Initializing database connection with URL:', databaseUrl);

const pool = new Pool({
  connectionString: databaseUrl,
});

// Add error handler for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
});

// Test database connection with detailed logging
pool.connect()
  .then(client => {
    console.log('Successfully connected to PostgreSQL database');
    
    // Test query to verify database setup
    return client
      .query('SELECT current_database(), current_user, version()')
      .then(result => {
        console.log('Database connection details:', {
          database: result.rows[0].current_database,
          user: result.rows[0].current_user,
          version: result.rows[0].version
        });
        client.release();
      })
      .catch(err => {
        client.release();
        throw err;
      });
  })
  .catch((error) => {
    console.error('Database connection error details:', {
      error: error.message,
      code: error.code,
      stack: error.stack
    });
    process.exit(1); // Exit if we can't connect to the database
  });

const db = drizzle(pool);

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  sessionStore: session.Store;
  
  // User Settings methods
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: number, settings: Partial<InsertUserSettings>): Promise<UserSettings>;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Post methods
  createPost(post: InsertPost): Promise<Post>;
  getPosts(): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostsByUserId(userId: number): Promise<Post[]>;
  
  // Comment methods
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPostId(postId: number): Promise<Comment[]>;
  
  // Reaction methods
  createReaction(reaction: InsertReaction): Promise<Reaction>;
  getReactionsByPostId(postId: number): Promise<Reaction[]>;
  getReactionByUserAndPost(userId: number, postId: number): Promise<Reaction | undefined>;
  removeReaction(userId: number, postId: number): Promise<void>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBetweenUsers(userOneId: number, userTwoId: number): Promise<Message[]>;
  getMessagesByReceiverId(receiverId: number): Promise<Message[]>;
  getConversations(userId: number): Promise<{user: User, lastMessage: Message}[]>;
  markMessageAsRead(messageId: number): Promise<void>;

  // Conversation methods
  createConversation(data: { createdBy: number; participantIds: number[] }): Promise<{ id: number; createdAt: Date }>;
  getConversationsByUserId(userId: number): Promise<{ id: number; createdAt: Date }[]>;
  getConversationParticipants(conversationId: number): Promise<{ userId: number }[]>;
  getMessagesByConversationId(conversationId: number): Promise<Message[]>;
  
  // Story methods
  createStory(story: InsertStory): Promise<Story>;
  getStoriesByUserId(userId: number): Promise<Story[]>;
  getStoriesByFriends(userId: number): Promise<Story[]>;
  
  // Friend methods
  createFriendRequest(request: InsertFriend): Promise<Friend>;
  getFriendRequestByUsers(userId: number, friendId: number): Promise<Friend | undefined>;
  getFriendsByUserId(userId: number): Promise<Friend[]>;
  updateFriendStatus(id: number, status: string): Promise<Friend>;
  
  // Group methods
  createGroup(group: InsertGroup): Promise<Group>;
  getGroupById(id: number): Promise<Group | undefined>;
  getGroups(): Promise<Group[]>;
  
  // Group member methods
  addGroupMember(member: InsertGroupMember): Promise<GroupMember>;
  getGroupMembers(groupId: number): Promise<GroupMember[]>;
  
  // Group message methods
  createGroupMessage(message: InsertGroupMessage): Promise<GroupMessage>;
  getGroupMessages(groupId: number): Promise<GroupMessage[]>;

  // Financial record methods
  createFinancialRecord(record: InsertFinancialRecord): Promise<FinancialRecord>;
  getFinancialRecords(userId: number): Promise<FinancialRecord[]>;
  getFinancialRecordsByCategory(userId: number, category: string): Promise<FinancialRecord[]>;
  updateFinancialRecord(id: number, record: Partial<InsertFinancialRecord>): Promise<FinancialRecord>;
  deleteFinancialRecord(id: number): Promise<void>;

  // Health record methods
  createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord>;
  getHealthRecords(userId: number): Promise<HealthRecord[]>;
  getHealthRecordsByType(userId: number, type: string): Promise<HealthRecord[]>;
  updateHealthRecord(id: number, record: Partial<InsertHealthRecord>): Promise<HealthRecord>;
  deleteHealthRecord(id: number): Promise<void>;

  // Subscription methods
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getSubscriptions(userId: number): Promise<Subscription[]>;
  getSubscriptionsByCategory(userId: number, category: string): Promise<Subscription[]>;
  getActiveSubscriptions(userId: number): Promise<Subscription[]>;
  updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription>;
  deleteSubscription(id: number): Promise<void>;
  getUpcomingRenewals(userId: number, daysAhead: number): Promise<Subscription[]>;
}

import { eq, asc, inArray } from "drizzle-orm";

export class PgStorage implements IStorage {
  public sessionStore: session.Store = new MemoryStore({
    checkPeriod: 86400000, // prune expired entries every 24h
  });

  async getUser(id: number): Promise<User | undefined> {
    try {
      console.log('Querying database for user ID:', id);
      const result = await db.select().from(users).where(eq(users.id, id));
      console.log('User query result:', result[0] ? 'Found' : 'Not found');
      return result[0];
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      console.log('Querying database for username:', username);
      
      // Use raw query to handle both password and password_hash columns
      const result = await pool.query(`
        SELECT id, username, display_name, email, 
               password_hash as password,
               profile_picture, location
        FROM users 
        WHERE username = $1
      `, [username]);
      
      console.log('Database result rows:', result.rows.length);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      // Map database column names to User schema property names
      const user = {
        id: result.rows[0].id,
        username: result.rows[0].username,
        displayName: result.rows[0].display_name,
        email: result.rows[0].email,
        password: result.rows[0].password,
        profilePicture: result.rows[0].profile_picture,
        location: result.rows[0].location,
        // createdAt: result.rows[0].created_at // Column removed from DB
      };
      
      console.log('Mapped user object:', { 
        id: user.id, 
        username: user.username, 
        hasPassword: !!user.password 
      });
      
      return user as unknown as User;
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      console.log('Creating new user:', { username: user.username });
      const result = await db.insert(users).values(user).returning();
      console.log('User created successfully:', { id: result[0]?.id });
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async createPost(post: InsertPost): Promise<Post> {
    const result = await db.insert(posts).values(post).returning();
    return result[0];
  }

  async getPosts(): Promise<Post[]> {
    return db.select().from(posts);
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id));
    return result[0];
  }

  async getPostsByUserId(userId: number): Promise<Post[]> {
    return db.select().from(posts).where(eq(posts.userId, userId));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const result = await db.insert(comments).values(comment).returning();
    return result[0];
  }

  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return db.select().from(comments).where(eq(comments.postId, postId));
  }

  async createReaction(reaction: InsertReaction): Promise<Reaction> {
    const result = await db.insert(reactions).values(reaction).returning();
    return result[0];
  }

  async getReactionsByPostId(postId: number): Promise<Reaction[]> {
    return db.select().from(reactions).where(eq(reactions.postId, postId));
  }

  async getReactionByUserAndPost(userId: number, postId: number): Promise<Reaction | undefined> {
    const result = await db
      .select()
      .from(reactions)
      .where(eq(reactions.userId, userId) && eq(reactions.postId, postId));
    return result[0];
  }

  async removeReaction(userId: number, postId: number): Promise<void> {
    await db
      .delete(reactions)
      .where(eq(reactions.userId, userId) && eq(reactions.postId, postId));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  async getMessagesBetweenUsers(userOneId: number, userTwoId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(
        eq(messages.senderId, userOneId) && eq(messages.receiverId, userTwoId) ||
          eq(messages.senderId, userTwoId) && eq(messages.receiverId, userOneId)
      );
  }

  async getMessagesByReceiverId(receiverId: number): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.receiverId, receiverId));
  }

  async getConversations(userId: number): Promise<{ user: User; lastMessage: Message }[]> {
    // This is a simplified implementation and might need further optimization
    const userMessages = await db.select().from(messages).where(eq(messages.senderId, userId) || eq(messages.receiverId, userId));
    const conversationUserIds = new Set<number>();
    userMessages.forEach((message) => {
      const otherId = message.senderId === userId ? message.receiverId : message.senderId;
      conversationUserIds.add(otherId);
    });

    const conversations: { user: User; lastMessage: Message }[] = [];
    for (const otherId of Array.from(conversationUserIds)) {
      const user = await this.getUser(otherId);
      if (!user) continue;

      const messagesBetween = await this.getMessagesBetweenUsers(userId, otherId);
      if (messagesBetween.length === 0) continue;

      const lastMessage = messagesBetween[messagesBetween.length - 1];

      conversations.push({
        user,
        lastMessage,
      });
    }

    return conversations;
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    await db
      .update(messages)
      .set({ read: true })
      .where(eq(messages.id, messageId));
  }

  async createStory(story: InsertStory): Promise<Story> {
    const result = await db.insert(stories).values(story).returning();
    return result[0];
  }

  async getStoriesByUserId(userId: number): Promise<Story[]> {
    return db.select().from(stories).where(eq(stories.userId, userId));
  }

  async getStoriesByFriends(userId: number): Promise<Story[]> {
    // This is a simplified implementation and might need further optimization
    const friendships = await this.getFriendsByUserId(userId);
    const friendIds = friendships
      .filter((f) => f.status === "accepted")
      .map((f) => (f.userId === userId ? f.friendId : f.userId));

    return db.select().from(stories).where(eq(stories.userId, userId));
  }

  async createFriendRequest(request: InsertFriend): Promise<Friend> {
    const result = await db.insert(friends).values(request).returning();
    return result[0];
  }

  async getFriendRequestByUsers(userId: number, friendId: number): Promise<Friend | undefined> {
    const result = await db
      .select()
      .from(friends)
      .where(eq(friends.userId, userId) && eq(friends.friendId, friendId));
    return result[0];
  }

  async getFriendsByUserId(userId: number): Promise<Friend[]> {
    return db.select().from(friends).where(eq(friends.userId, userId) || eq(friends.friendId, userId));
  }

  async updateFriendStatus(id: number, status: string): Promise<Friend> {
    const result = await db
      .update(friends)
      .set({ status: status })
      .where(eq(friends.id, id))
      .returning();
    return result[0];
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const result = await db.insert(groups).values(group).returning();
    return result[0];
  }

  async getGroupById(id: number): Promise<Group | undefined> {
    const result = await db.select().from(groups).where(eq(groups.id, id));
    return result[0];
  }

  async getGroups(): Promise<Group[]> {
    return db.select().from(groups);
  }

  async addGroupMember(member: InsertGroupMember): Promise<GroupMember> {
    const result = await db.insert(groupMembers).values(member).returning();
    return result[0];
  }

  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    return db.select().from(groupMembers).where(eq(groupMembers.groupId, groupId));
  }

  async createGroupMessage(message: InsertGroupMessage): Promise<GroupMessage> {
    const result = await db.insert(groupMessages).values(message).returning();
    return result[0];
  }

  async getGroupMessages(groupId: number): Promise<GroupMessage[]> {
    return db.select().from(groupMessages).where(eq(groupMessages.groupId, groupId));
  }

  // Conversation methods
  async createConversation(data: { createdBy: number; participantIds: number[] }): Promise<{ id: number; createdAt: Date }> {
    const [conversation] = await db
      .insert(conversations)
      .values({
        createdBy: data.createdBy,
      })
      .returning();

    // Add participants
    await Promise.all(
      data.participantIds.map(userId =>
        db
          .insert(conversationParticipants)
          .values({
            conversationId: conversation.id,
            userId
          })
      )
    );

    return conversation;
  }

  async getConversationsByUserId(userId: number): Promise<{ id: number; createdAt: Date }[]> {
    const participations = await db
      .select()
      .from(conversationParticipants)
      .where(eq(conversationParticipants.userId, userId));

    if (participations.length === 0) return [];

    const conversationIds = participations.map(p => p.conversationId);

    return db
      .select()
      .from(conversations)
      .where(inArray(conversations.id, conversationIds));
  }

  async getConversationParticipants(conversationId: number): Promise<{ userId: number }[]> {
    return db
      .select()
      .from(conversationParticipants)
      .where(eq(conversationParticipants.conversationId, conversationId));
  }

  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.timestamp));
  }

  // Financial record methods
  // Financial record methods
  async createFinancialRecord(record: InsertFinancialRecord): Promise<FinancialRecord> {
    const [newRecord] = await db.insert(financialRecords).values(record).returning();
    return newRecord;
  }

  async getFinancialRecords(userId: number): Promise<FinancialRecord[]> {
    const records = await db.select().from(financialRecords);
return records.filter(record => record.userId === userId);
  }

  async getFinancialRecordsByCategory(userId: number, category: string): Promise<FinancialRecord[]> {
    const records = await db.select().from(financialRecords);
return records.filter(record => record.userId === userId && record.category === category);
  }

  async updateFinancialRecord(id: number, record: Partial<InsertFinancialRecord>): Promise<FinancialRecord> {
    const [updatedRecord] = await db.update(financialRecords)
      .set(record)
      .where(eq(financialRecords.id, id))
      .returning();
    return updatedRecord;
  }

  async deleteFinancialRecord(id: number): Promise<void> {
    await db.delete(financialRecords).where(eq(financialRecords.id, id));
  }

  // Health record methods
  async createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord> {
    const [newRecord] = await db.insert(healthRecords).values(record).returning();
    return newRecord;
  }

  async getHealthRecords(userId: number): Promise<HealthRecord[]> {
    const records = await db.select().from(healthRecords);
return records.filter(record => record.userId === userId);
  }

  async getHealthRecordsByType(userId: number, type: string): Promise<HealthRecord[]> {
    const records = await db.select().from(healthRecords);
return records.filter(record => record.userId === userId && record.type === type);
  }

  async updateHealthRecord(id: number, record: Partial<InsertHealthRecord>): Promise<HealthRecord> {
    const [updatedRecord] = await db.update(healthRecords)
      .set(record)
      .where(eq(healthRecords.id, id))
      .returning();
    return updatedRecord;
  }

  async deleteHealthRecord(id: number): Promise<void> {
    await db.delete(healthRecords).where(eq(healthRecords.id, id));
  }

  // Subscription methods
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    return newSubscription;
  }

  async getSubscriptions(userId: number): Promise<Subscription[]> {
    const records = await db.select().from(subscriptions);
    return records.filter(record => record.userId === userId);
  }

  async getSubscriptionsByCategory(userId: number, category: string): Promise<Subscription[]> {
    const records = await db.select().from(subscriptions);
    return records.filter(record => record.userId === userId && record.category === category);
  }

  async getActiveSubscriptions(userId: number): Promise<Subscription[]> {
    const records = await db.select().from(subscriptions);
    return records.filter(record => record.userId === userId && record.status === 'active');
  }

  async updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription> {
    const [updatedSubscription] = await db.update(subscriptions)
      .set(subscription)
      .where(eq(subscriptions.id, id))
      .returning();
    return updatedSubscription;
  }

  // User Settings methods
  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    const result = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return result[0];
  }

  async createUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const result = await db.insert(userSettings).values(settings).returning();
    return result[0];
  }

  async updateUserSettings(userId: number, settings: Partial<InsertUserSettings>): Promise<UserSettings> {
    const result = await db
      .update(userSettings)
      .set({
        ...settings,
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, userId))
      .returning();
    return result[0];
  }

  async deleteSubscription(id: number): Promise<void> {
    await db.delete(subscriptions).where(eq(subscriptions.id, id));
  }

  async getUpcomingRenewals(userId: number, daysAhead: number): Promise<Subscription[]> {
    const records = await db.select().from(subscriptions);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    return records.filter(record => 
      record.userId === userId && 
      record.status === 'active' &&
      record.nextBillingDate <= futureDate
    );
  }
}

export const storage = new PgStorage();
