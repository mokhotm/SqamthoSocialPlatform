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
  bio: text('bio'),
  location: text('location'),
});

export type User = typeof users.$inferSelect;

export const friends = pgTable('friends', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  friendId: integer('friend_id').notNull().references(() => users.id),
  status: varchar('status', { length: 10 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueFriendship: unique('unique_friendship').on(table.userId, table.friendId),
}));

export type Friend = typeof friends.$inferSelect;

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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  bio: true,
  profilePicture: true,
  location: true,
});

export const insertPostSchema = createInsertSchema(posts).pick({
  userId: true,
  content: true,
  imageUrl: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  postId: true,
  userId: true,
  content: true,
});

export const insertReactionSchema = createInsertSchema(reactions).pick({
  postId: true,
  userId: true,
  type: true,
});

export const insertMessageSchema = createInsertSchema(messages);

// Create insert schemas for new features
export const insertFinancialRecordSchema = createInsertSchema(financialRecords).pick({
  userId: true,
  title: true,
  description: true,
  category: true,
  amount: true,
  date: true,
});

export const insertHealthRecordSchema = createInsertSchema(healthRecords).pick({
  userId: true,
  type: true,
  title: true,
  description: true,
  date: true,
  value: true,
  unit: true,
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

export const insertGroupMessageSchema = createInsertSchema(groupMessages).pick({
  groupId: true,
  userId: true,
  content: true,
});

export const insertFriendSchema = createInsertSchema(friends).pick({
  userId: true,
  friendId: true,
  status: true,
});

export const insertConversationSchema = createInsertSchema(conversations);

export const insertConversationParticipantSchema = createInsertSchema(conversationParticipants);

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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

// Subscription schema
export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  name: true,
  description: true,
  amount: true,
  currency: true,
  billingCycle: true,
  nextBillingDate: true,
  category: true,
  provider: true,
  status: true,
  autoRenew: true,
  reminderDays: true,
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
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).extend({
  preferences: z.record(z.string(), z.any()).optional(),
  contentPreferences: z.object({
    feedType: z.string(),
    postDisplay: z.string(),
    defaultSort: z.string(),
    contentFilters: z.array(z.string()),
  }).optional(),
  accessibilitySettings: z.object({
    fontSize: z.string(),
    highContrast: z.boolean(),
    reducedMotion: z.boolean(),
    screenReaderOptimized: z.boolean(),
  }).optional(),
  communicationSettings: z.object({
    messagePrivacy: z.string(),
    readReceipts: z.boolean(),
    typingIndicators: z.boolean(),
    lastSeenPrivacy: z.string(),
  }).optional(),
  regionalSettings: z.object({
    timeZone: z.string(),
    dateFormat: z.string(),
    timeFormat: z.string(),
    currency: z.string(),
  }).optional(),
  securitySettings: z.object({
    twoFactorEnabled: z.boolean(),
    loginAlerts: z.boolean(),
    trustedDevices: z.array(z.string()),
    activeSessions: z.array(z.string()),
  }).optional(),
});
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

// Extended schemas for frontend validation
export const registerUserSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
