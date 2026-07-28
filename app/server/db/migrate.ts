/**
 * Drizzle マイグレーション実行スクリプト
 * コマンド: npm run db:migrate
 */

import { migrate } from 'drizzle-orm/mysql2/migrator';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import path from 'path';

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    user: process.env.DATABASE_USER || 'thread_user',
    password: process.env.DATABASE_PASSWORD || 'thread_password_change_me',
    database: process.env.DATABASE_NAME || 'thread_db',
  });

  const db = drizzle(connection);

  console.log('Running migrations...');
  const migrationsFolder = path.join(process.cwd(), 'app/server/db/migrations');

  try {
    await migrate(db, { migrationsFolder });
    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigrations();
