/**
 * Drizzle マイグレーション実行スクリプト
 * Docker環境での実行: entrypoint.sh から呼び出し
 * または手動実行時: npx tsx app/server/db/migrate.ts
 */

import { migrate } from 'drizzle-orm/mysql2/migrator';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    user: process.env.DATABASE_USER || 'thread_user',
    password: process.env.DATABASE_PASSWORD || 'thread_password_change_me',
    database: process.env.DATABASE_NAME || 'thread_db',
  });

  const db = drizzle(connection);

  console.log('🚀 Running migrations...');
  const migrationsFolder = path.join(__dirname, 'migrations');

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
