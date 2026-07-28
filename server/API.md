# API ドキュメント

セッション認証を使用した掲示板アプリケーションのAPI仕様書です。

---

## 📋 認証フロー

### セッション管理
- **認証方式**: Cookie ベースのセッション認証
- **セッション保存先**: MySQL (`sessions` テーブル)
- **セッション有効期限**: 24時間
- **Cookie設定**: 
  - `HttpOnly`: true （XSS対策）
  - `SameSite`: strict （CSRF対策）
  - `Secure`: production環境のみtrue

---

## 🔐 認証エンドポイント

### 1. ユーザー登録

**エンドポイント**: `POST /api/auth/register`

**リクエストボディ**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**バリデーション規則**:
- **username**: 3～50文字、英数字とアンダースコア、ハイフンのみ
- **email**: 有効なメールアドレス形式
- **password**: 8～255文字、大文字・小文字・数字を含む

**成功レスポンス** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "isActive": true,
      "isAdmin": false,
      "emailVerified": false,
      "createdAt": "2026-07-29T01:20:00Z",
      "updatedAt": "2026-07-29T01:20:00Z"
    },
    "message": "ユーザー登録が完了しました"
  }
}
```

**エラーレスポンス**:
```json
{
  "success": false,
  "error": {
    "code": "USER_ALREADY_EXISTS",
    "message": "このメールアドレスは既に登録されています"
  }
}
```

**エラーコード**:
- `USER_ALREADY_EXISTS` (409): メールアドレスまたはユーザー名が既に使用されている
- `VALIDATION_ERROR` (400): 入力値のバリデーションエラー
- `INTERNAL_ERROR` (500): サーバーエラー

---

### 2. ログイン

**エンドポイント**: `POST /api/auth/login`

**リクエストボディ**:
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**成功レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "isActive": true,
      "isAdmin": false,
      "emailVerified": false,
      "createdAt": "2026-07-29T01:20:00Z",
      "updatedAt": "2026-07-29T01:20:00Z"
    },
    "message": "ログインしました"
  }
}
```

**Set-Cookie ヘッダー**:
```
Set-Cookie: sessionId=<UUID>; HttpOnly; SameSite=strict; Path=/; Max-Age=86400
```

**エラーレスポンス**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "メールアドレスまたはパスワードが無効です"
  }
}
```

**エラーコード**:
- `INVALID_CREDENTIALS` (401): メールアドレスまたはパスワードが不正
- `VALIDATION_ERROR` (400): 入力値のバリデーションエラー

---

### 3. ログアウト

**エンドポイント**: `POST /api/auth/logout`

**リクエスト**: なし（Cookie自動送信）

**成功レスポンス** (200 OK):
```json
{
  "success": true,
  "data": null
}
```

**Set-Cookie ヘッダー** (クリア):
```
Set-Cookie: sessionId=; Path=/; Max-Age=0
```

---

## 👤 ユーザーエンドポイント

### 4. プロフィール取得

**エンドポイント**: `GET /api/user/profile`

**認証**: 必須（セッション）

**リクエスト**: なし

**成功レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "isActive": true,
    "isAdmin": false,
    "emailVerified": false,
    "createdAt": "2026-07-29T01:20:00Z",
    "updatedAt": "2026-07-29T01:20:00Z"
  }
}
```

**エラーレスポンス**:
```json
{
  "success": false,
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "セッションが見つかりません"
  }
}
```

**エラーコード**:
- `SESSION_NOT_FOUND` (401): セッションが存在しない
- `SESSION_EXPIRED` (401): セッション有効期限切れ
- `UNAUTHORIZED` (401): 認証に失敗

---

## 🔒 セキュリティ機能

### パスワード管理
- ✅ bcrypt (salt rounds: 10) でハッシュ化
- ✅ プレーンテキスト保存なし
- ✅ 複雑性要件: 大文字・小文字・数字を含む

### セッション管理
- ✅ UUID v4 で一意のセッションID生成
- ✅ MySQL に安全に保存
- ✅ 有効期限ベース（24時間）
- ✅ 期限切れセッション自動削除

### 入力検証
- ✅ メールアドレス形式検証
- ✅ ユーザー名フォーマット検証
- ✅ パスワード複雑性チェック
- ✅ 必須フィールドチェック

### Cookie対策
- ✅ HttpOnly: XSS対策
- ✅ SameSite=strict: CSRF対策
- ✅ Secure: HTTPS通信のみ（本番環境）

---

## 📊 エラーコード一覧

| コード | HTTP | 説明 |
|--------|------|------|
| `INVALID_CREDENTIALS` | 401 | メールまたはパスワードが無効 |
| `USER_NOT_FOUND` | 404 | ユーザーが見つからない |
| `USER_ALREADY_EXISTS` | 409 | メールまたはユーザー名が既に使用されている |
| `SESSION_EXPIRED` | 401 | セッション有効期限切れ |
| `SESSION_NOT_FOUND` | 401 | セッションが見つからない |
| `UNAUTHORIZED` | 401 | 認証に失敗 |
| `VALIDATION_ERROR` | 400 | 入力値のバリデーションエラー |
| `INTERNAL_ERROR` | 500 | サーバーエラー |

---

## 🧪 テスト例

### cURL でのユーザー登録

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

### cURL でのログイン

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

### cURL でのプロフィール取得（セッション付き）

```bash
curl -X GET http://localhost:3000/api/user/profile \
  -b cookies.txt
```

### cURL でのログアウト

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

---

## 📝 実装メモ

### リポジトリ層
- `UserRepository`: ユーザーDB操作
- `SessionRepository`: セッションDB操作

### サービス層
- `UserService`: ユーザー登録・認証ロジック
- `SessionService`: セッション管理ロジック

### ミドルウェア層
- `SessionAuth`: Cookie検証・セッション認証

### ユーティリティ
- `validation.ts`: 入力値検証関数
- `errorHandler.ts`: エラーレスポンス生成

---

**最終更新**: 2026年7月29日
