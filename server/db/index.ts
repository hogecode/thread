import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export async function getDB() {
  if (dbInstance) {
    return dbInstance;
  }

  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    user: process.env.DATABASE_USER || 'thread_user',
    password: process.env.DATABASE_PASSWORD || 'thread_password_change_me',
    database: process.env.DATABASE_NAME || 'thread_db',
  });

  dbInstance = drizzle(connection, { schema, mode: 'default' });
  return dbInstance;
}

export { schema };
export type * from './schema';
