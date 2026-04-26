import { pgTable, serial, text, timestamp, integer, boolean, varchar, unique, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  displayName: text('display_name').notNull(),
  email: text('email').notNull(),
  password_hash: text('password_hash').notNull(),
  profilePicture: text('profile_picture'),
  coverImage: text('cover_image'), // Add coverImage field
  bio: text('bio'),
  location: text('location'),
  gender: text('gender'),
  ethnicity: text('ethnicity'),
  dateOfBirth: timestamp('date_of_birth'),
  createdAt: timestamp('created_at').defaultNow().notNull(), // Add createdAt field
});

export type User = typeof users.$inferSelect;

export const friends = pgTable('friends', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  friendId: integer('friend_id').notNull().references(() => users.id),
  status: varchar('status', { length: 10 }).notNull().default('pending'),
  relationship: varchar('relationship', { length: 50 }),
  birthYear: integer('birth_year'),
  deathYear: integer('death_year'),
  isDeceased: boolean('is_deceased').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueFriendship: unique('unique_friendship').on(table.userId, table.friendId),
}));


export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'like', 'love', etc
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversationParticipants = pgTable("conversation_participants", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  userId: integer("user_id").notNull().references(() => users.id),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  userId: integer("user_id").notNull().references(() => users.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  read: boolean("read").default(false).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  memberCount: integer("member_count").default(0).notNull(),
  messageCount: integer("message_count").default(0).notNull(),
});

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").notNull(), // 'admin', 'member'
});

export const groupMessages = pgTable("group_messages", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  imageUrl: text("image_url"),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  attendeeCount: integer("attendee_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventAttendees = pgTable("event_attendees", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  userId: integer("user_id").notNull().references(() => users.id),
  status: text("status").notNull(), // 'going', 'maybe', 'not_going'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("ZAR"),
  billingCycle: text("billing_cycle").notNull(),
  nextBillingDate: timestamp("next_billing_date").notNull(),
  category: text("category").notNull(),
  provider: text("provider").notNull(),
  status: text("status").notNull().default("active"),
  autoRenew: boolean("auto_renew").notNull().default(true),
  reminderDays: integer("reminder_days").notNull().default(7),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Financial Records
export const financialRecords = pgTable("financial_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  amount: integer("amount").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Health Records
export const healthRecords = pgTable("health_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'exercise', 'medication', 'symptom', 'vital'
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  value: text("value"), // For storing measurements, symptoms, etc.
  unit: text("unit"), // For measurements like 'kg', 'steps', 'bpm'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Saved Posts table
export const savedPosts = pgTable("saved_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  postId: integer("post_id").notNull().references(() => posts.id),
  collectionName: text("collection_name").default("All Posts").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Marketplace Items table
export const marketplaceItems = pgTable("marketplace_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  currency: text("currency").default("ZAR").notNull(),
  location: text("location").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  tags: jsonb("tags").default([]),
  delivery: boolean("delivery").default(false).notNull(),
  collection: boolean("collection").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = z.object({
  username: z.string(),
  displayName: z.string(),
  email: z.string(),
  password_hash: z.string(),
  profilePicture: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  ethnicity: z.string().nullable().optional(),
  dateOfBirth: z.union([z.string(), z.date()]).nullable().optional(),
  createdAt: z.date().optional(), // createdAt has a default in DB, so it's optional for insert
});

export const insertPostSchema = z.object({
  userId: z.number(),
  content: z.string(),
  imageUrl: z.string().nullable().optional(),
});

export const insertCommentSchema = z.object({
  postId: z.number(),
  userId: z.number(),
  content: z.string(),
});

export const insertReactionSchema = createInsertSchema(reactions).pick({
  postId: true,
  userId: true,
  type: true,
});

export const insertMessageSchema = z.object({
  conversationId: z.number(),
  userId: z.number(),
  senderId: z.number(),
  receiverId: z.number(),
  content: z.string(),
  read: z.boolean().optional(),
});

// Create insert schemas for new features
export const insertFinancialRecordSchema = z.object({
  userId: z.number(),
  title: z.string(),
  description: z.string().nullable().optional(),
  category: z.string(),
  amount: z.number(),
  date: z.date(),
});

export const insertHealthRecordSchema = z.object({
  userId: z.number(),
  type: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  date: z.date(),
  value: z.string().nullable().optional(),
  unit: z.string().nullable().optional(),
});

export const insertStorySchema = createInsertSchema(stories).pick({
  userId: true,
  content: true,
  imageUrl: true,
  expiresAt: true,
});

export const insertGroupSchema = createInsertSchema(groups).pick({
  name: true,
  description: true,
  imageUrl: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).pick({
  groupId: true,
  userId: true,
  role: true,
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  location: true,
  startDate: true,
  endDate: true,
  imageUrl: true,
  creatorId: true,
});

export const insertEventAttendeeSchema = createInsertSchema(eventAttendees).pick({
  eventId: true,
  userId: true,
  status: true,
});

export const insertGroupMessageSchema = z.object({
  groupId: z.number(),
  userId: z.number(),
  content: z.string(),
});

export const insertFriendSchema = createInsertSchema(friends).pick({
  userId: true,
  friendId: true,
  status: true,
  relationship: true,
  birthYear: true,
  deathYear: true,
  isDeceased: true,
});

export const insertSavedPostSchema = z.object({
  userId: z.number(),
  postId: z.number(),
  collectionName: z.string().optional(),
});

export const insertMarketplaceItemSchema = z.object({
  userId: z.number(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  currency: z.string().optional(),
  location: z.string(),
  category: z.string(),
  imageUrl: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  delivery: z.boolean().optional(),
  collection: z.boolean().optional(),
});

export const insertConversationSchema = createInsertSchema(conversations);

export const insertConversationParticipantSchema = createInsertSchema(conversationParticipants);

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof insertEventSchema._type;

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type Reaction = typeof reactions.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect;

export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;

export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type GroupMember = typeof groupMembers.$inferSelect;

export type InsertGroupMessage = z.infer<typeof insertGroupMessageSchema>;
export type GroupMessage = typeof groupMessages.$inferSelect;

export type InsertFriend = z.infer<typeof insertFriendSchema>;
export type Friend = typeof friends.$inferSelect;

export type InsertSavedPost = z.infer<typeof insertSavedPostSchema>;
export type SavedPost = typeof savedPosts.$inferSelect;

export type InsertMarketplaceItem = z.infer<typeof insertMarketplaceItemSchema>;
export type MarketplaceItem = typeof marketplaceItems.$inferSelect;

// Subscription schema
export const insertSubscriptionSchema = z.object({
  userId: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  amount: z.number(),
  currency: z.string().optional(),
  billingCycle: z.string(),
  nextBillingDate: z.date(),
  category: z.string(),
  provider: z.string(),
  status: z.string().optional(),
  autoRenew: z.boolean().optional(),
  reminderDays: z.number().optional(),
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Type exports for new features
export type InsertFinancialRecord = z.infer<typeof insertFinancialRecordSchema>;
export type FinancialRecord = typeof financialRecords.$inferSelect;

export type InsertHealthRecord = z.infer<typeof insertHealthRecordSchema>;
export type HealthRecord = typeof healthRecords.$inferSelect;

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  theme: text("theme").default("light"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  language: text("language").default("en"),
  privacyLevel: text("privacy_level").default("public"),
  showOnlineStatus: boolean("show_online_status").default(true),
  showActivityStatus: boolean("show_activity_status").default(true),
  preferences: jsonb("preferences").default({}),
  contentPreferences: jsonb("content_preferences").default({
    feedType: "balanced",
    postDisplay: "expanded",
    defaultSort: "newest",
    contentFilters: [],
  }),
  accessibilitySettings: jsonb("accessibility_settings").default({
    fontSize: "medium",
    highContrast: false,
    reducedMotion: false,
    screenReaderOptimized: false,
  }),
  communicationSettings: jsonb("communication_settings").default({
    messagePrivacy: "everyone",
    readReceipts: true,
    typingIndicators: true,
    lastSeenPrivacy: "everyone",
  }),
  regionalSettings: jsonb("regional_settings").default({
    timeZone: "UTC",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    currency: "ZAR",
  }),
  securitySettings: jsonb("security_settings").default({
    twoFactorEnabled: false,
    loginAlerts: true,
    trustedDevices: [],
    activeSessions: [],
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}); // Dummy comment to trigger type refresh

export const insertUserSettingsSchema = createInsertSchema(userSettings).pick({
  userId: true,
  theme: true,
  notificationsEnabled: true,
  emailNotifications: true,
  pushNotifications: true,
  language: true,
  privacyLevel: true,
  showOnlineStatus: true,
  showActivityStatus: true,
  preferences: true,
  contentPreferences: true,
  accessibilitySettings: true,
  communicationSettings: true,
  regionalSettings: true,
  securitySettings: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

// Extended schemas for frontend validation
export const registerUserSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password_hash === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
