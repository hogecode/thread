import { getDB, schema } from '../db'
import { eq } from 'drizzle-orm'
import type { CreateUserInput, UserData } from '../types'

/**
 * ユーザーリポジトリ
 * ユーザーテーブルへのDB操作を担当
 */
export class UserRepository {
  private db: any

  private constructor(db: any) {
    this.db = db
  }

  /**
   * UserRepositoryのインスタンスを作成（非同期ファクトリパターン）
   */
  static async create(): Promise<UserRepository> {
    const db = await getDB()
    return new UserRepository(db)
  }

  /**
   * メールアドレスでユーザーを検索
   */
  async findByEmail(email: string) {
    const result = await this.db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1)
    return result[0] || null
  }

  /**
   * ユーザーIDでユーザーを検索
   */
  async findById(id: number) {
    const result = await this.db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1)
    return result[0] || null
  }

  /**
   * ユーザー名でユーザーを検索
   */
  async findByUsername(username: string) {
    const result = await this.db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1)
    return result[0] || null
  }

  /**
   * 新規ユーザーを作成
   */
  async create(data: CreateUserInput & { passwordHash: string }) {
    await this.db.insert(schema.users).values({
      username: data.username,
      email: data.email,
      passwordHash: data.passwordHash,
    })

    return this.findByEmail(data.email)
  }

  /**
   * ユーザー情報をオブジェクトに変換（パスワード除外）
   */
  formatUserData(user: any): UserData {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      isAdmin: user.isAdmin,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
