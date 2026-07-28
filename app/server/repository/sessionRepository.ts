import { getDB, schema } from '../db'
import { eq, lt } from 'drizzle-orm'
import type { SessionData } from '../types'

/**
 * セッションリポジトリ
 * セッションテーブルへのDB操作を担当
 */
export class SessionRepository {
  private db: any

  private constructor(db: any) {
    this.db = db
  }

  /**
   * SessionRepositoryのインスタンスを作成（非同期ファクトリパターン）
   */
  static async create(): Promise<SessionRepository> {
    const db = await getDB()
    return new SessionRepository(db)
  }

  /**
   * セッションIDでセッションを検索
   */
  async findBySessionId(sessionId: string) {
    const result = await this.db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.sessionId, sessionId))
      .limit(1)
    return result[0] || null
  }

  /**
   * ユーザーIDでセッションを検索
   */
  async findByUserId(userId: number) {
    const result = await this.db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.userId, userId))
      .limit(1)
    return result[0] || null
  }

  /**
   * 新規セッションを作成
   */
  async create(sessionId: string, userId: number, expiresAt: Date) {
    const result = await this.db.insert(schema.sessions).values({
      sessionId,
      userId,
      expiresAt,
    })

    return this.findBySessionId(sessionId)
  }

  /**
   * セッションを削除
   */
  async delete(sessionId: string) {
    return this.db.delete(schema.sessions).where(eq(schema.sessions.sessionId, sessionId))
  }

  /**
   * ユーザーの既存セッションを削除
   */
  async deleteByUserId(userId: number) {
    return this.db.delete(schema.sessions).where(eq(schema.sessions.userId, userId))
  }

  /**
   * 有効期限切れのセッションをクリーンアップ
   */
  async deleteExpiredSessions() {
    return this.db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date()))
  }

  /**
   * セッションデータをオブジェクトに変換
   */
  formatSessionData(session: any): SessionData {
    return {
      id: session.id,
      sessionId: session.sessionId,
      userId: session.userId,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      user: session.user,
    }
  }
}
