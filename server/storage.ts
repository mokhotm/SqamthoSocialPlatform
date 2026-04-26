import { pool, db } from "./db.js";
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
  type SavedPost, type InsertSavedPost,
  type MarketplaceItem, type InsertMarketplaceItem,
  type Event, type InsertEvent,
  users, posts, comments, reactions, messages, stories, groups, groupMembers, groupMessages, friends,
  financialRecords, healthRecords, subscriptions, userSettings,
  savedPosts, marketplaceItems, events, eventAttendees,
  conversations, conversationParticipants,
  insertUserSchema, insertPostSchema, insertCommentSchema, insertReactionSchema,
  insertMessageSchema, insertStorySchema, insertGroupSchema, insertGroupMemberSchema,
  insertGroupMessageSchema, insertFriendSchema, insertSubscriptionSchema,
  insertSavedPostSchema, insertMarketplaceItemSchema, insertEventSchema
} from "../shared/schema.js";
import session from "express-session";
import createMemoryStore from "memorystore";
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, or, sql, inArray, asc, desc, type SQL, type SQLWrapper } from 'drizzle-orm';
import { Pool } from 'pg';
import { z } from 'zod';

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // User Settings methods
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: number, settings: Partial<InsertUserSettings>): Promise<UserSettings>;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Post methods
  createPost(post: InsertPost): Promise<Post>;
  getPosts(): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostsByUserId(userIds: number[]): Promise<Post[]>;
  updatePost(id: number, data: { content?: string; imageUrl?: string | null }): Promise<Post>;
  deletePost(id: number): Promise<void>;
  
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
  getStoriesByUserId(userId: number): Promise<(Story & { user: User })[]>;
  getStoriesByFriends(userId: number): Promise<(Story & { user: User })[]>;
  
  // Friend methods
  createFriendRequest(request: InsertFriend): Promise<Friend>;
  getFriendRequestByUsers(userId: number, friendId: number): Promise<Friend | undefined>;
  getFriendsByUserId(userId: number): Promise<Friend[]>;
  getFriendsWithUsernamesByUserId(userId: number): Promise<{ id: number; username: string }[]>;
  updateFriendStatus(id: number, status: string): Promise<Friend>;
  updateFriendship(id: number, updates: Partial<InsertFriend>): Promise<Friend>;

  // Post methods
  getPostsByMention(condition: SQL<unknown>): Promise<Post[]>;

  // Group methods
  createGroup(group: InsertGroup): Promise<Group>;
  getGroupById(id: number): Promise<Group | undefined>;
  getGroups(): Promise<Group[]>;
  getGroupsByUserId(userId: number): Promise<Group[]>;
  updateGroup(id: number, group: Partial<InsertGroup>): Promise<Group>;
  deleteGroup(id: number): Promise<void>;
  
  // Group member methods
  addGroupMember(member: InsertGroupMember): Promise<GroupMember>;
  removeGroupMember(groupId: number, userId: number): Promise<void>;
  getGroupMembers(groupId: number): Promise<GroupMember[]>;
  getGroupMembershipsByUserId(userId: number): Promise<GroupMember[]>;
  getGroupMembershipByUser(userId: number, groupId: number): Promise<GroupMember | undefined>;
  
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

  // Saved Post methods
  savePost(save: InsertSavedPost): Promise<SavedPost>;
  getSavedPosts(userId: number): Promise<any[]>;
  removeSavedPost(userId: number, postId: number): Promise<void>;

  // Marketplace methods
  createMarketplaceItem(item: InsertMarketplaceItem): Promise<MarketplaceItem>;
  getMarketplaceItems(): Promise<any[]>;
  getMarketplaceItemById(id: number): Promise<MarketplaceItem | undefined>;
  deleteMarketplaceItem(id: number): Promise<void>;

  // Event methods
  createEvent(event: InsertEvent): Promise<Event>;
  getEventById(id: number): Promise<Event | undefined>;
  getEvents(): Promise<Event[]>;
  getEventsByCreatorId(creatorId: number): Promise<Event[]>;

  // Logic methods
  getMemoriesOnThisDay(userId: number): Promise<Post[]>;
  getExploreContent(userId: number): Promise<any[]>;
}

export class PgStorage implements IStorage {
  public sessionStore: session.Store = new MemoryStore({
    checkPeriod: 86400000, // prune expired entries every 24h
  });

  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0];
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username));
      return result[0];
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  // Updated createUser method
  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      password_hash: user.password_hash,
      bio: user.bio ?? null,
      profilePicture: user.profilePicture ?? null,
      location: user.location ?? null,
      coverImage: user.coverImage ?? null,
      gender: user.gender ?? null,
      ethnicity: user.ethnicity ?? null,
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
      createdAt: user.createdAt ?? new Date(),
    }).returning();
    return result[0];
  }

  async updateUser(userId: number, updates: Partial<z.infer<typeof insertUserSchema>>): Promise<User> {
    try {
      const updateData: Record<string, any> = {};
      if (updates.displayName !== undefined) updateData.displayName = updates.displayName;
      if (updates.bio !== undefined) updateData.bio = updates.bio;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.profilePicture !== undefined) updateData.profilePicture = updates.profilePicture;
      if (updates.coverImage !== undefined) updateData.coverImage = updates.coverImage;
      if (updates.gender !== undefined) updateData.gender = updates.gender;
      if (updates.ethnicity !== undefined) updateData.ethnicity = updates.ethnicity;
      
      if (updates.dateOfBirth !== undefined) {
        if (updates.dateOfBirth === null) {
          updateData.dateOfBirth = null;
        } else {
          const dateObj = new Date(updates.dateOfBirth);
          if (!isNaN(dateObj.getTime())) {
            updateData.dateOfBirth = dateObj;
          }
        }
      }
      
      if (Object.keys(updateData).length === 0) {
        throw new Error('No valid fields to update');
      }
      
      const result = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();
      
      if (result.length === 0) {
        throw new Error('User not found');
      }
      
      return result[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Updated createPost method
  async createPost(post: z.infer<typeof insertPostSchema>): Promise<Post> {
    const result = await db.insert(posts).values({
      userId: post.userId,
      content: post.content,
      imageUrl: post.imageUrl ?? null,
    }).returning();
    return result[0];
  }

  async getPosts(): Promise<Post[]> {
    const result = await db.select().from(posts).orderBy(desc(posts.createdAt));
    return result;
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id));
    return result[0];
  }

  async getPostsByUserId(userIds: number[]): Promise<Post[]> {
    if (userIds.length === 0) {
      return [];
    }
    return db.select().from(posts).where(inArray(posts.userId, userIds)).orderBy(desc(posts.createdAt));
  }

  async getPostsByMention(condition: SQLWrapper): Promise<Post[]> {
    return db.select().from(posts).where(condition);
  }

  async updatePost(id: number, data: { content?: string; imageUrl?: string | null }): Promise<Post> {
    const updateData: Record<string, any> = {};
    if (data.content !== undefined) updateData.content = data.content;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update');
    }

    const [updated] = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, id))
      .returning();

    if (!updated) {
      throw new Error('Post not found');
    }
    return updated;
  }

  async deletePost(id: number): Promise<void> {
    // Delete associated data first (comments, reactions, saved posts)
    await db.delete(comments).where(eq(comments.postId, id));
    await db.delete(reactions).where(eq(reactions.postId, id));
    await db.delete(savedPosts).where(eq(savedPosts.postId, id));
    // Delete the post itself
    await db.delete(posts).where(eq(posts.id, id));
  }

  // Updated createComment method
  async createComment(comment: z.infer<typeof insertCommentSchema>): Promise<Comment> {
    const result = await db.insert(comments).values({
      postId: comment.postId,
      userId: comment.userId,
      content: comment.content,
    }).returning();
    return result[0];
  }

  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return db.select().from(comments).where(eq(comments.postId, postId));
  }

  // Updated createReaction method
  async createReaction(reaction: z.infer<typeof insertReactionSchema>): Promise<Reaction> {
    const result = await db.insert(reactions).values({
      postId: reaction.postId,
      userId: reaction.userId,
      type: reaction.type,
    }).returning();
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

  async createMessage(messageData: {
    conversationId: number;
    userId: number;
    senderId: number;
    receiverId: number;
    content: string;
  }): Promise<Message> {
    try {
      const result = await db.insert(messages).values({
        conversationId: messageData.conversationId,
        userId: messageData.userId,
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
        content: messageData.content,
      }).returning();
      
      return result[0];
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
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

  async getStoriesByUserId(userId: number): Promise<(Story & { user: User })[]> {
    const results = await db
      .select({
        story: stories,
        user: users,
      })
      .from(stories)
      .where(and(eq(stories.userId, userId), sql`${stories.expiresAt} > NOW()`))
      .innerJoin(users, eq(stories.userId, users.id));

    return results.map(r => ({
      ...r.story,
      user: r.user
    }));
  }

  async getStoriesByFriends(userId: number): Promise<(Story & { user: User })[]> {
    const friendships = await this.getFriendsByUserId(userId);
    const friendIds = friendships
      .filter((f) => f.status === "accepted")
      .map((f) => (f.userId === userId ? f.friendId : f.userId));
    
    const userIdsToFetch = [userId, ...friendIds];

    const results = await db
      .select({
        story: stories,
        user: users,
      })
      .from(stories)
      .where(and(
        inArray(stories.userId, userIdsToFetch),
        sql`${stories.expiresAt} > NOW()`
      ))
      .innerJoin(users, eq(stories.userId, users.id))
      .orderBy(desc(stories.createdAt));

    return results.map(r => ({
      ...r.story,
      user: r.user
    }));
  }

  // Updated createFriendRequest method
  async createFriendRequest(request: z.infer<typeof insertFriendSchema>): Promise<Friend> {
    const result = await db.insert(friends).values({
      userId: request.userId,
      friendId: request.friendId,
      status: request.status,
    }).returning();
    return result[0];
  }

  async getFriendRequestByUsers(userId: number, friendId: number): Promise<Friend | undefined> {
    const result = await db
      .select()
      .from(friends)
      .where(and(eq(friends.userId, userId), eq(friends.friendId, friendId)));
    return result[0];
  }

  async getFriendsByUserId(userId: number): Promise<Friend[]> {
    return db.select().from(friends).where(or(eq(friends.userId, userId), eq(friends.friendId, userId)));
  }

  async getFriendsWithUsernamesByUserId(userId: number): Promise<{ id: number; username: string }[]> {
    const friendRelationships = await db.select().from(friends).where(or(eq(friends.userId, userId), eq(friends.friendId, userId)));
    const friendIds = friendRelationships.map(friendship => friendship.userId === userId ? friendship.friendId : friendship.userId);

    if (friendIds.length === 0) {
      return [];
    }

    const friendUsers = await db.select({ id: users.id, username: users.username }).from(users).where(inArray(users.id, friendIds));
    return friendUsers;
  }

  async updateFriendStatus(id: number, status: string): Promise<Friend> {
    const result = await db
      .update(friends)
      .set({ status: status })
      .where(eq(friends.id, id))
      .returning();
    return result[0];
  }

  async updateFriendship(id: number, updates: Partial<InsertFriend>): Promise<Friend> {
    const result = await db
      .update(friends)
      .set(updates)
      .where(eq(friends.id, id))
      .returning();
    return result[0];
  }

  // Updated createGroup method
  async createGroup(group: InsertGroup): Promise<Group> {
    try {
      const result = await db.insert(groups).values({
        name: group.name,
        description: group.description ?? null,
        imageUrl: group.imageUrl ?? null,
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  async getGroupById(id: number): Promise<Group | undefined> {
    try {
      const result = await db.select().from(groups).where(eq(groups.id, id));
      return result[0];
    } catch (error) {
      console.error('Error getting group by ID:', error);
      throw error;
    }
  }

  async getGroups(): Promise<Group[]> {
    try {
      return await db.select().from(groups);
    } catch (error) {
      console.error('Error getting all groups:', error);
      throw error;
    }
  }

  async getGroupsByUserId(userId: number): Promise<Group[]> {
    try {
      const results = await db
        .select({
          group: groups,
        })
        .from(groupMembers)
        .where(eq(groupMembers.userId, userId))
        .innerJoin(groups, eq(groupMembers.groupId, groups.id));
      
      return results.map(r => r.group);
    } catch (error) {
      console.error('Error getting groups for user:', error);
      throw error;
    }
  }

  async updateGroup(id: number, data: Partial<InsertGroup>): Promise<Group> {
    try {
      const updateData: Record<string, any> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

      if (Object.keys(updateData).length === 0) {
        throw new Error('No valid fields to update');
      }

      const [updated] = await db
        .update(groups)
        .set(updateData)
        .where(eq(groups.id, id))
        .returning();

      if (!updated) {
        throw new Error('Group not found');
      }
      return updated;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  async deleteGroup(id: number): Promise<void> {
    try {
      // Delete associated data first
      await db.delete(groupMessages).where(eq(groupMessages.groupId, id));
      await db.delete(groupMembers).where(eq(groupMembers.groupId, id));
      // Delete the group itself
      await db.delete(groups).where(eq(groups.id, id));
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }

  // Updated addGroupMember method
  async addGroupMember(member: InsertGroupMember): Promise<GroupMember> {
    try {
      // Start a transaction to update member count safely
      const result = await db.transaction(async (tx) => {
        const [newMember] = await tx.insert(groupMembers).values({
          groupId: member.groupId,
          userId: member.userId,
          role: member.role,
        }).returning();

        // Increment member count
        await tx.update(groups)
          .set({ memberCount: sql`${groups.memberCount} + 1` })
          .where(eq(groups.id, member.groupId));

        return newMember;
      });
      return result;
    } catch (error) {
      console.error('Error adding group member:', error);
      throw error;
    }
  }

  async removeGroupMember(groupId: number, userId: number): Promise<void> {
    try {
      await db.transaction(async (tx) => {
        const result = await tx.delete(groupMembers)
          .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
          .returning();

        if (result.length > 0) {
          // Decrement member count
          await tx.update(groups)
            .set({ memberCount: sql`${groups.memberCount} - 1` })
            .where(eq(groups.id, groupId));
        }
      });
    } catch (error) {
      console.error('Error removing group member:', error);
      throw error;
    }
  }

  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    try {
      return await db.select().from(groupMembers).where(eq(groupMembers.groupId, groupId));
    } catch (error) {
      console.error('Error getting group members:', error);
      throw error;
    }
  }

  async getGroupMembershipsByUserId(userId: number): Promise<GroupMember[]> {
    try {
      return await db.select().from(groupMembers).where(eq(groupMembers.userId, userId));
    } catch (error) {
      console.error('Error getting memberships for user:', error);
      throw error;
    }
  }

  async getGroupMembershipByUser(userId: number, groupId: number): Promise<GroupMember | undefined> {
    try {
      const result = await db
        .select()
        .from(groupMembers)
        .where(and(eq(groupMembers.userId, userId), eq(groupMembers.groupId, groupId)));
      return result[0];
    } catch (error) {
      console.error('Error getting group membership for user:', error);
      throw error;
    }
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
  async createFinancialRecord(record: InsertFinancialRecord): Promise<FinancialRecord> {
    // Validate required fields
    const validatedRecord = {
      userId: record.userId,
      title: record.title,
      category: record.category,
      amount: record.amount,
      date: record.date,
      description: record.description || null,
    };
    const [newRecord] = await db.insert(financialRecords).values(validatedRecord).returning();
    return newRecord;
  }

  async getFinancialRecords(userId: number): Promise<FinancialRecord[]> {
    return await db.select().from(financialRecords).where(eq(financialRecords.userId, userId));
  }
  
  async getFinancialRecordsByCategory(userId: number, category: string): Promise<FinancialRecord[]> {
    return await db.select()
      .from(financialRecords)
      .where(and(eq(financialRecords.userId, userId), eq(financialRecords.category, category)));
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
    // Validate required fields
    const validatedRecord = {
      userId: record.userId,
      type: record.type,
      title: record.title,
      date: record.date,
      description: record.description || null,
      value: record.value || null,
      unit: record.unit || null,
    };
    const [newRecord] = await db.insert(healthRecords).values(validatedRecord).returning();
    return newRecord;
  }

  async getHealthRecords(userId: number): Promise<HealthRecord[]> {
    return await db.select().from(healthRecords).where(eq(healthRecords.userId, userId));
  }
  
  async getHealthRecordsByType(userId: number, type: string): Promise<HealthRecord[]> {
    return await db.select()
      .from(healthRecords)
      .where(and(eq(healthRecords.userId, userId), eq(healthRecords.type, type)));
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
    // Validate required fields
    const validatedSubscription = {
      userId: subscription.userId,
      name: subscription.name,
      amount: subscription.amount,
      billingCycle: subscription.billingCycle,
      nextBillingDate: subscription.nextBillingDate,
      category: subscription.category,
      provider: subscription.provider,
      description: subscription.description || null,
      currency: subscription.currency || 'USD',
      status: subscription.status || 'active',
      autoRenew: subscription.autoRenew || true,
      reminderDays: subscription.reminderDays || 3,
    };
    const [newSubscription] = await db.insert(subscriptions).values(validatedSubscription).returning();
    return newSubscription;
  }

  async getSubscriptions(userId: number): Promise<Subscription[]> {
    return await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
  }
  
  async getSubscriptionsByCategory(userId: number, category: string): Promise<Subscription[]> {
    return await db.select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.category, category)));
  }
  
  async getActiveSubscriptions(userId: number): Promise<Subscription[]> {
    return await db.select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'active')));
  }

  async updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription> {
    const [updatedSubscription] = await db.update(subscriptions)
      .set(subscription)
      .where(eq(subscriptions.id, id))
      .returning();
    return updatedSubscription;
  }

  async deleteSubscription(id: number): Promise<void> {
    await db.delete(subscriptions).where(eq(subscriptions.id, id));
  }

  async getUpcomingRenewals(userId: number, daysAhead: number): Promise<Subscription[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    return await db.select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active'),
          sql`${subscriptions.nextBillingDate} <= ${futureDate}`
        )
      );
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
      .set(settings)
      .where(eq(userSettings.userId, userId))
      .returning();
    return result[0];
  }

  // Saved Post methods
  async savePost(save: InsertSavedPost): Promise<SavedPost> {
    const [result] = await db.insert(savedPosts).values(save).returning();
    return result;
  }

  async getSavedPosts(userId: number): Promise<any[]> {
    const results = await db
      .select({
        savedPost: savedPosts,
        post: posts,
        author: users,
      })
      .from(savedPosts)
      .where(eq(savedPosts.userId, userId))
      .innerJoin(posts, eq(savedPosts.postId, posts.id))
      .innerJoin(users, eq(posts.userId, users.id));

    return results.map(r => ({
      ...r.savedPost,
      post: {
        ...r.post,
        author: {
          name: r.author.displayName || r.author.username,
          username: r.author.username,
          avatar: r.author.profilePicture
        }
      }
    }));
  }

  async removeSavedPost(userId: number, postId: number): Promise<void> {
    await db.delete(savedPosts).where(and(eq(savedPosts.userId, userId), eq(savedPosts.postId, postId)));
  }

  // Marketplace methods
  async createMarketplaceItem(item: InsertMarketplaceItem): Promise<MarketplaceItem> {
    const [result] = await db.insert(marketplaceItems).values(item).returning();
    return result;
  }

  async getMarketplaceItems(): Promise<any[]> {
    const results = await db
      .select({
        item: marketplaceItems,
        seller: users,
      })
      .from(marketplaceItems)
      .innerJoin(users, eq(marketplaceItems.userId, users.id))
      .orderBy(asc(marketplaceItems.createdAt));

    return results.map(r => ({
      ...r.item,
      seller: {
        name: r.seller.displayName || r.seller.username,
        username: r.seller.username,
        avatar: r.seller.profilePicture
      }
    }));
  }

  async getMarketplaceItemById(id: number): Promise<MarketplaceItem | undefined> {
    const [result] = await db.select().from(marketplaceItems).where(eq(marketplaceItems.id, id));
    return result;
  }

  async deleteMarketplaceItem(id: number): Promise<void> {
    await db.delete(marketplaceItems).where(eq(marketplaceItems.id, id));
  }

  // Event methods
  async createEvent(event: InsertEvent): Promise<Event> {
    const [result] = await db.insert(events).values(event).returning();
    return result;
  }

  async getEventById(id: number): Promise<Event | undefined> {
    const [result] = await db.select().from(events).where(eq(events.id, id));
    return result;
  }

  async getEvents(): Promise<Event[]> {
    return db.select().from(events).orderBy(asc(events.startDate));
  }

  async getEventsByCreatorId(creatorId: number): Promise<Event[]> {
    return db.select().from(events).where(eq(events.creatorId, creatorId));
  }

  // Logic methods
  async getMemoriesOnThisDay(userId: number): Promise<Post[]> {
    const today = new Date();
    const res = await db.select().from(posts).where(
      and(
        eq(posts.userId, userId),
        sql`EXTRACT(MONTH FROM ${posts.createdAt}) = ${today.getMonth() + 1}`,
        sql`EXTRACT(DAY FROM ${posts.createdAt}) = ${today.getDate()}`,
        sql`EXTRACT(YEAR FROM ${posts.createdAt}) < ${today.getFullYear()}`
      )
    );
    return res;
  }

  async getExploreContent(_userId: number): Promise<any[]> {
    const results = await db
      .select({
        post: posts,
        author: users,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .limit(20)
      .orderBy(asc(posts.createdAt));

    return results.map(r => ({
      ...r.post,
      author: {
        displayName: r.author.displayName,
        username: r.author.username,
        profilePicture: r.author.profilePicture
      }
    }));
  }
}

export const storage = new PgStorage();
