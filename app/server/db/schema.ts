import {
  mysqlTable,
  int,
  varchar,
  text,
  timestamp,
  boolean,
  bigint,
  index,
  uniqueIndex,
  foreignKey,
  mysqlEnum,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// ==================== Users & Authentication ====================

/**
 * ユーザーテーブル
 * ユーザーの基本情報、認証情報を保持
 */
export const users = mysqlTable(
  'users',
  {
    id: int('id').primaryKey().autoincrement(),
    username: varchar('username', { length: 50 }).notNull().unique(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    isAdmin: boolean('is_admin').notNull().default(false),
    emailVerified: boolean('email_verified').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({
    emailIdx: index('idx_email').on(table.email),
    usernameIdx: index('idx_username').on(table.username),
    isActiveIdx: index('idx_is_active').on(table.isActive),
  })
);

/**
 * ユーザープロフィール詳細テーブル
 * ユーザーの詳細情報（紹介文、画像など）
 */
export const userProfiles = mysqlTable(
  'user_profiles',
  {
    id: int('id').primaryKey().autoincrement(),
    userId: int('user_id').notNull(),
    bio: text('bio'),
    profileImageUrl: varchar('profile_image_url', { length: 500 }),
    displayName: varchar('display_name', { length: 100 }),
    location: varchar('location', { length: 100 }),
    website: varchar('website', { length: 500 }),
    postCount: int('post_count').notNull().default(0),
    threadCount: int('thread_count').notNull().default(0),
    followingCount: int('following_count').notNull().default(0),
    followerCount: int('follower_count').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: uniqueIndex('idx_user_id_unique').on(table.userId),
    fk_user: foreignKey({ columns: [table.userId], foreignColumns: [users.id] })
      .onDelete('cascade')
      .onUpdate('cascade'),
  })
);

/**
 * ユーザーフォローテーブル
 * ユーザー間のフォロー関係を管理
 */
export const userFollows = mysqlTable(
  'user_follows',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
    followerId: int('follower_id').notNull(),
    followingId: int('following_id').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    followerIdx: index('idx_follower_id').on(table.followerId),
    followingIdx: index('idx_following_id').on(table.followingId),
    uniqueFollowIdx: uniqueIndex('idx_follower_following_unique').on(
      table.followerId,
      table.followingId
    ),
    fk_follower: foreignKey({ columns: [table.followerId], foreignColumns: [users.id] })
      .onDelete('cascade')
      .onUpdate('cascade'),
    fk_following: foreignKey({ columns: [table.followingId], foreignColumns: [users.id] })
      .onDelete('cascade')
      .onUpdate('cascade'),
  })
);

// ==================== Categories ====================

/**
 * カテゴリテーブル
 * スレッドのカテゴリ分類
 */
export const categories = mysqlTable(
  'categories',
  {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    description: text('description'),
    displayOrder: int('display_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({
    slugIdx: index('idx_slug').on(table.slug),
    isActiveIdx: index('idx_is_active').on(table.isActive),
  })
);

// ==================== Threads & Posts ====================

/**
 * スレッドテーブル
 * 掲示板のスレッド情報
 */
export const threads = mysqlTable(
  'threads',
  {
    id: int('id').primaryKey().autoincrement(),
    categoryId: int('category_id').notNull(),
    createdById: int('created_by_id').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    postCount: int('post_count').notNull().default(0),
    viewCount: int('view_count').notNull().default(0),
    lastPostAt: timestamp('last_post_at'),
    isArchived: boolean('is_archived').notNull().default(false),
    isDeleted: boolean('is_deleted').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({
    categoryIdx: index('idx_category_id').on(table.categoryId),
    createdByIdx: index('idx_created_by_id').on(table.createdById),
    titleIdx: index('idx_title').on(table.title),
    isDeletedIdx: index('idx_is_deleted').on(table.isDeleted),
    createdAtIdx: index('idx_created_at').on(table.createdAt),
    lastPostAtIdx: index('idx_last_post_at').on(table.lastPostAt),
    fk_category: foreignKey({ columns: [table.categoryId], foreignColumns: [categories.id] })
      .onDelete('restrict')
      .onUpdate('cascade'),
    fk_created_by: foreignKey({ columns: [table.createdById], foreignColumns: [users.id] })
      .onDelete('cascade')
      .onUpdate('cascade'),
  })
);

/**
 * 投稿テーブル
 * スレッド内の投稿
 */
export const posts = mysqlTable(
  'posts',
  {
    id: int('id').primaryKey().autoincrement(),
    threadId: int('thread_id').notNull(),
    createdById: int('created_by_id').notNull(),
    content: text('content').notNull(),
    editedAt: timestamp('edited_at'),
    isDeleted: boolean('is_deleted').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({
    threadIdx: index('idx_thread_id').on(table.threadId),
    createdByIdx: index('idx_created_by_id').on(table.createdById),
    isDeletedIdx: index('idx_is_deleted').on(table.isDeleted),
    createdAtIdx: index('idx_created_at').on(table.createdAt),
    fk_thread: foreignKey({ columns: [table.threadId], foreignColumns: [threads.id] })
      .onDelete('cascade')
      .onUpdate('cascade'),
    fk_created_by: foreignKey({ columns: [table.createdById], foreignColumns: [users.id] })
      .onDelete('cascade')
      .onUpdate('cascade'),
  })
);

// ==================== Messaging ====================

/**
 * メッセージスレッドテーブル
 * ユーザー間のメッセージ会話を管理
 */
export const messageThreads = mysqlTable(
  'message_threads',
  {
    id: int('id').primaryKey().autoincrement(),
    participant1Id: int('participant1_id').notNull(),
    participant2Id: int('participant2_id').notNull(),
    lastMessageAt: timestamp('last_message_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({
    participant1Idx: index('idx_participant1_id').on(table.participant1Id),
    participant2Idx: index('idx_participant2_id').on(table.participant2Id),
    uniqueParticipantsIdx: uniqueIndex('idx_participants_unique').on(
      table.participant1Id,
      table.participant2Id
    ),
    fk_participant1: foreignKey({ columns: [table.participant1Id], foreignColumns: [users.id] })
      .onDelete('cascade')
      .onUpdate('cascade'),
    fk_participant2: foreignKey({ columns: [table.participant2Id], foreignColumns: [users.id] })
      .onDelete('cascade')
      .onUpdate('cascade'),
  })
);

/**
 * メッセージテーブル
 * プライベートメッセージの内容
 */
export const messages = mysqlTable(
  'messages',
  {
    id: int('id').primaryKey().autoincrement(),
    messageThreadId: int('message_thread_id').notNull(),
    senderId: int('sender_id').notNull(),
    recipientId: int('recipient_id').notNull(),
    content: text('content').notNull(),
    isRead: boolean('is_read').notNull().default(false),
    readAt: timestamp('read_at'),
    isDeleted: boolean('is_deleted').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    messageThreadIdx: index('idx_message_thread_id').on(table.messageThreadId),
    senderIdx: index('idx_sender_id').on(table.senderId),
    recipientIdx: index('idx_recipient_id').on(table.recipientId),
    isReadIdx: index('idx_is_read').on(table.isRead),
    createdAtIdx: index('idx_created_at').on(table.createdAt),
    fk_message_thread: foreignKey({
      columns: [table.messageThreadId],
      foreignColumns: [messageThreads.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    fk_sender: foreignKey({ columns: [table.senderId], foreignColumns: [users.id] })
      .onDelete('cascade')
      .onUpdate('cascade'),
    fk_recipient: foreignKey({ columns: [table.recipientId], foreignColumns: [users.id] })
      .onDelete('cascade')
      .onUpdate('cascade'),
  })
);

// ==================== Reports & Moderation ====================

/**
 * ユーザー報告テーブル
 * スレッド・投稿への報告を管理
 */
export const userReports = mysqlTable(
  'user_reports',
  {
    id: int('id').primaryKey().autoincrement(),
    reporterId: int('reporter_id').notNull(),
    targetType: mysqlEnum('target_type', ['thread', 'post']).notNull(),
    targetId: int('target_id').notNull(),
    reason: varchar('reason', { length: 100 }).notNull(),
    description: text('description'),
    status: mysqlEnum('status', ['pending', 'reviewed', 'resolved']).notNull().default('pending'),
    reviewedAt: timestamp('reviewed_at'),
    reviewedById: int('reviewed_by_id'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({
    reporterIdx: index('idx_reporter_id').on(table.reporterId),
    targetIdx: index('idx_target_type_id').on(table.targetType, table.targetId),
    statusIdx: index('idx_status').on(table.status),
    createdAtIdx: index('idx_created_at').on(table.createdAt),
    fk_reporter: foreignKey({ columns: [table.reporterId], foreignColumns: [users.id] })
      .onDelete('cascade')
      .onUpdate('cascade'),
    fk_reviewed_by: foreignKey({ columns: [table.reviewedById], foreignColumns: [users.id] })
      .onDelete('set null')
      .onUpdate('cascade'),
  })
);

/**
 * 管理ログテーブル
 * 管理者のアクション履歴を記録
 */
export const adminLogs = mysqlTable(
  'admin_logs',
  {
    id: int('id').primaryKey().autoincrement(),
    adminId: int('admin_id').notNull(),
    action: varchar('action', { length: 50 }).notNull(),
    targetType: varchar('target_type', { length: 50 }),
    targetId: int('target_id'),
    description: text('description'),
    details: text('details'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    adminIdx: index('idx_admin_id').on(table.adminId),
    actionIdx: index('idx_action').on(table.action),
    targetIdx: index('idx_target_type_id').on(table.targetType, table.targetId),
    createdAtIdx: index('idx_created_at').on(table.createdAt),
    fk_admin: foreignKey({ columns: [table.adminId], foreignColumns: [users.id] })
      .onDelete('cascade')
      .onUpdate('cascade'),
  })
);

// ==================== Relations ====================

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  threadsCreated: many(threads),
  postsCreated: many(posts),
  followingRelations: many(userFollows, {
    relationName: 'follower',
  }),
  followerRelations: many(userFollows, {
    relationName: 'following',
  }),
  messageThreadsAsParticipant1: many(messageThreads, {
    relationName: 'participant1',
  }),
  messageThreadsAsParticipant2: many(messageThreads, {
    relationName: 'participant2',
  }),
  messagesSent: many(messages, {
    relationName: 'sender',
  }),
  messagesReceived: many(messages, {
    relationName: 'recipient',
  }),
  reportsMade: many(userReports),
  adminLogs: many(adminLogs),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, {
    fields: [userFollows.followerId],
    references: [users.id],
    relationName: 'follower',
  }),
  following: one(users, {
    fields: [userFollows.followingId],
    references: [users.id],
    relationName: 'following',
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  threads: many(threads),
}));

export const threadsRelations = relations(threads, ({ one, many }) => ({
  category: one(categories, {
    fields: [threads.categoryId],
    references: [categories.id],
  }),
  createdBy: one(users, {
    fields: [threads.createdById],
    references: [users.id],
  }),
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  thread: one(threads, {
    fields: [posts.threadId],
    references: [threads.id],
  }),
  createdBy: one(users, {
    fields: [posts.createdById],
    references: [users.id],
  }),
}));

export const messageThreadsRelations = relations(messageThreads, ({ one, many }) => ({
  participant1: one(users, {
    fields: [messageThreads.participant1Id],
    references: [users.id],
    relationName: 'participant1',
  }),
  participant2: one(users, {
    fields: [messageThreads.participant2Id],
    references: [users.id],
    relationName: 'participant2',
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  messageThread: one(messageThreads, {
    fields: [messages.messageThreadId],
    references: [messageThreads.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: 'sender',
  }),
  recipient: one(users, {
    fields: [messages.recipientId],
    references: [users.id],
    relationName: 'recipient',
  }),
}));

export const userReportsRelations = relations(userReports, ({ one }) => ({
  reporter: one(users, {
    fields: [userReports.reporterId],
    references: [users.id],
  }),
  reviewedBy: one(users, {
    fields: [userReports.reviewedById],
    references: [users.id],
  }),
}));

export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminLogs.adminId],
    references: [users.id],
  }),
}));
