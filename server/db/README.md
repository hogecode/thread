# Drizzle ORM データベース基盤

Drizzle ORMを使用した掲示板アプリケーションのデータベース管理システムです。

## 📋 スキーマ概要

### 1. ユーザー管理系テーブル（4つ）
- **users** - ユーザーアカウント情報
- **user_profiles** - ユーザープロフィール詳細
- **user_follows** - ユーザーフォロー関係

### 2. コンテンツ管理系テーブル（3つ）
- **categories** - スレッドカテゴリ
- **threads** - 掲示板スレッド
- **posts** - スレッド内の投稿

### 3. メッセージング系テーブル（2つ）
- **message_threads** - メッセージスレッド
- **messages** - プライベートメッセージ

### 4. 管理系テーブル（2つ）
- **user_reports** - スレッド・投稿の報告
- **admin_logs** - 管理者アクションログ

**合計: 11個のテーブル**

---

## 🚀 セットアップ手順

### 1. パッケージインストール
```bash
npm install
```

### 2. マイグレーション生成
```bash
npm run db:generate
```

このコマンドでは以下が行われます：
- `app/server/db/schema.ts`からスキーマを読み込み
- MySQL用のマイグレーション SQL ファイルを生成
- `app/server/db/migrations/`に保存

### 3. マイグレーション実行
```bash
npm run db:migrate
```

このコマンドでは以下が行われます：
- `app/server/db/migrations/`のSQLを順番に実行
- MySQLデータベースにテーブルを作成

---

## 📁 ファイル構成

```
app/server/db/
├── schema.ts          # Drizzle スキーマ定義（全テーブル）
├── index.ts          # DB接続・初期化
├── migrate.ts        # マイグレーション実行スクリプト
├── migrations/       # 自動生成されるマイグレーションファイル
└── README.md         # このファイル
```

---

## 🔧 主要ファイルの説明

### schema.ts
Drizzle ORM のスキーマ定義ファイルです。以下の内容を含みます：

#### テーブル定義
- 各テーブルのカラム定義（型、デフォルト値、バリデーション）
- インデックス定義（パフォーマンス最適化）
- 外部キー制約（参照整合性）

#### リレーション定義
- テーブル間の関係性を定義
- TypeScript型安全性の確保
- N+1クエリ問題の回避

### index.ts
データベース接続と初期化を行います：
```typescript
import { getDB } from '~/server/db'

// API内で使用
const db = await getDB()
const users = await db.select().from(users)
```

### migrate.ts
マイグレーション実行スクリプト：
```bash
# 手動実行
node app/server/db/migrate.ts

# package.jsonスクリプト経由
npm run db:migrate
```

---

## 💻 使用例

### ユーザー作成
```typescript
import { getDB, schema } from '~/server/db'

export default defineEventHandler(async (event) => {
  const db = await getDB()
  
  const newUser = await db.insert(schema.users).values({
    username: 'john_doe',
    email: 'john@example.com',
    passwordHash: 'hashed_password',
  })
  
  return newUser
})
```

### スレッド取得（リレーション含む）
```typescript
import { getDB, schema } from '~/server/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = await getDB()
  
  const thread = await db.query.threads.findFirst({
    where: eq(schema.threads.id, 1),
    with: {
      category: true,
      createdBy: true,
      posts: true,
    },
  })
  
  return thread
})
```

### ページネーション付きスレッド一覧
```typescript
import { getDB, schema } from '~/server/db'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = await getDB()
  
  const threads = await db
    .select()
    .from(schema.threads)
    .where(eq(schema.threads.isDeleted, false))
    .orderBy(desc(schema.threads.createdAt))
    .limit(20)
    .offset(0)
  
  return threads
})
```

---

## 🔐 セキュリティ特性

### パスワード管理
- `users.passwordHash` で暗号化パスワードを保存
- プレーンテキストパスワードは一切保存しない
- bcryptなどのハッシュ関数の使用を推奨

### ソフトデリート
- `threads.isDeleted`, `posts.isDeleted` フィールド
- 実データ削除ではなくフラグで管理
- データリカバリが可能

### アクティブ状態管理
- `users.isActive` で アカウント無効化が可能
- ハードデリート（完全削除）ではなくフラグで管理

### 管理者追跡
- `admin_logs` テーブルで管理者の全アクション記録
- 改ざん防止とコンプライアンス対応

---

## 📊 パフォーマンス最適化

### インデックス戦略
```sql
-- ユーザー検索用
idx_username      # ユーザー名検索
idx_email         # メールアドレス検索

-- スレッド検索用
idx_category_id   # カテゴリ別フィルタリング
idx_created_at    # 新着順ソート
idx_last_post_at  # 活動順ソート

-- 投稿検索用
idx_thread_id     # スレッド別投稿取得
idx_created_at    # 投稿日時順

-- メッセージング
idx_sender_id     # 送信者別
idx_recipient_id  # 受信者別
idx_is_read       # 未読メッセージ検索
```

### クエリ最適化
- 不要なカラムの取得を避ける（SELECT指定）
- リレーション側の不必要な取得を避ける（with指定）
- バッチ処理でN+1回避

---

## 🔄 マイグレーション管理

### マイグレーションファイルの構成
```
migrations/
├── 0000_initial_schema.sql  # 初期スキーマ
├── 0001_add_columns.sql     # カラム追加
└── ...
```

### マイグレーション実行の仕組み
1. `drizzle-kit generate` でSQL生成
2. `npm run db:migrate` で実行
3. マイグレーション履歴がDB保存（Drizzle管理）

### スキーマ変更時の流れ
1. `schema.ts` を編集
2. `npm run db:generate` で新しいマイグレーション生成
3. `npm run db:migrate` で実行
4. Git にコミット

---

## 🗂️ テーブル詳細設計

### Users テーブル
```
id (PK)
username (UNIQUE)
email (UNIQUE)
passwordHash
isActive (BOOLEAN)
isAdmin (BOOLEAN)
emailVerified (BOOLEAN)
createdAt
updatedAt
```

### Threads テーブル
```
id (PK)
categoryId (FK)
createdById (FK)
title (VARCHAR 255)
description (TEXT)
postCount (デノーマライズ統計)
viewCount (デノーマライズ統計)
lastPostAt (最終更新時刻)
isArchived (BOOLEAN)
isDeleted (BOOLEAN - ソフトデリート)
createdAt
updatedAt
```

### Posts テーブル
```
id (PK)
threadId (FK)
createdById (FK)
content (TEXT)
editedAt (編集履歴)
isDeleted (BOOLEAN - ソフトデリート)
createdAt
updatedAt
```

---

## 📝 今後の拡張

### Phase 2対応予定
- ユーザープロフィール機能
- フォロー機能の強化
- 検索機能の最適化

### Phase 3対応予定
- メッセージング完全実装
- 報告・報復機能

### Phase 4対応予定
- パフォーマンス最適化（キャッシング）
- 新しいインデックス追加
- クエリ最適化

---

## 🐛 トラブルシューティング

### マイグレーション失敗時
```bash
# マイグレーション状態確認
# MySQLにアクセスして確認
mysql -h localhost -u thread_user -p thread_db
SHOW TABLES;
```

### DB接続エラー
```
環境変数確認:
- DATABASE_HOST
- DATABASE_PORT
- DATABASE_NAME
- DATABASE_USER
- DATABASE_PASSWORD
```

### スキーマ変更のロールバック
```bash
# 最新のマイグレーション削除
# migrations/ フォルダから不要なファイル削除
# schema.ts を元の状態に戻す
npm run db:generate
```

---

## 📚 参考リソース

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [MySQL Drizzle ドライバ](https://orm.drizzle.team/docs/get-started-mysql)
- [スキーマ定義ガイド](https://orm.drizzle.team/docs/sql-schema-declaration)

---

**最終更新**: 2026年7月29日
