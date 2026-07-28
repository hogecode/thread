import type { SessionData, UserData } from '../types'
import { AppError, ErrorCodes } from '../types'
import { SessionRepository } from '../repository/sessionRepository'

/**
 * UUID v4を生成
 * TODO: 既存のUUIDライブラリを使用することも検討
 */
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * セッションサービス
 * セッション管理のビジネスロジックを担当
 */
export class SessionService {
  private sessionRepository: SessionRepository
  private sessionDuration = 24 * 60 * 60 * 1000 // 24時間（ミリ秒）

  private constructor(sessionRepository: SessionRepository) {
    this.sessionRepository = sessionRepository
  }

  /**
   * SessionServiceのインスタンスを作成（非同期ファクトリパターン）
   */
  static async create(): Promise<SessionService> {
    const sessionRepository = await SessionRepository.create()
    return new SessionService(sessionRepository)
  }

  /**
   * セッションを作成
   */
  async createSession(userId: number): Promise<SessionData> {
    // 既存セッションを削除
    await this.sessionRepository.deleteByUserId(userId)

    // 新しいセッションIDを生成
    const sessionId = uuidv4()

    // 有効期限を計算
    const expiresAt = new Date(Date.now() + this.sessionDuration)

    // セッションを作成
    const session = await this.sessionRepository.create(sessionId, userId, expiresAt)

    if (!session) {
      throw new AppError(
        ErrorCodes.INTERNAL_ERROR,
        'セッション作成に失敗しました',
        500
      )
    }

    return this.sessionRepository.formatSessionData(session)
  }

  /**
   * セッションを検証
   */
  async validateSession(sessionId: string): Promise<SessionData> {
    // セッションを検索
    const session = await this.sessionRepository.findBySessionId(sessionId)

    if (!session) {
      throw new AppError(
        ErrorCodes.SESSION_NOT_FOUND,
        'セッションが見つかりません',
        401
      )
    }

    // 有効期限をチェック
    if (new Date(session.expiresAt) < new Date()) {
      // 期限切れセッションを削除
      await this.sessionRepository.delete(sessionId)
      throw new AppError(
        ErrorCodes.SESSION_EXPIRED,
        'セッションの有効期限が切れています',
        401
      )
    }

    return this.sessionRepository.formatSessionData(session)
  }

  /**
   * セッションを削除
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.sessionRepository.delete(sessionId)
  }

  /**
   * 期限切れセッションをクリーンアップ
   */
  async cleanupExpiredSessions(): Promise<void> {
    await this.sessionRepository.deleteExpiredSessions()
  }

  /**
   * セッションの有効期限を取得
   */
  getSessionDuration(): number {
    return this.sessionDuration
  }

  /**
   * セッションCookieの設定値を取得
   */
  getSessionCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: this.sessionDuration / 1000, // 秒単位
      path: '/',
    }
  }
}
