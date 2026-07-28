/// <reference types="node" />
import type { Config } from 'drizzle-kit';

export default {
  schema: './app/server/db/schema.ts',
  out: './app/server/db/migrations',
  driver: 'mysql2',
  dbCredentials: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    user: process.env.DATABASE_USER || 'thread_user',
    password: process.env.DATABASE_PASSWORD || 'thread_password_change_me',
    database: process.env.DATABASE_NAME || 'thread_db',
  },
} satisfies Config;
