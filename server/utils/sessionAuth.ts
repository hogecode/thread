import { serialize } from 'cookie'
import type { AuthContext } from '../types'
import { AppError, ErrorCodes } from '../types'
import { SessionService } from '../service/sessionService'
import { UserService } from '../service/userService'

/**
 * セッション認証ミドルウェア
 */
export class SessionAuth {
  private sessionService: SessionService
  private userService: UserService

  private constructor(sessionService: SessionService, userService: UserService) {
    this.sessionService = sessionService
    this.userService = userService
  }

  /**
   * SessionAuthのインスタンスを作成（非同期ファクトリパターン）
   */
  static async create(): Promise<SessionAuth> {
    const sessionService = await SessionService.create()
    const userService = await UserService.create()
    return new SessionAuth(sessionService, userService)
  }

  /**
   * CookieからセッションIDを抽出
   */
  private extractSessionIDFromCookie(cookieHeader: string | undefined): string | null {
    if (!cookieHeader) return null

    // Cookieヘッダーをparse
    const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie: string) => {
      const parts = cookie.trim().split('=')
      if (parts.length >= 2) {
        const name = parts[0]
        const value = parts[1]
        if (name && value) {
          acc[name] = decodeURIComponent(value)
        }
      }
      return acc
    }, {})

    return cookies.sessionId || null
  }

  /**
   * リクエストからセッションを検証
   */
  async validateFromRequest(event: any): Promise<AuthContext> {
    // Cookieヘッダーを取得
    const cookieHeader = event.node?.req?.headers?.cookie || event.headers?.cookie

    // セッションIDを抽出
    const sessionId = this.extractSessionIDFromCookie(cookieHeader)
    if (!sessionId) {
      throw new AppError(
        ErrorCodes.SESSION_NOT_FOUND,
        'セッションが見つかりません',
        401
      )
    }

    try {
      // セッションを検証
      const session = await this.sessionService.validateSession(sessionId)

      // ユーザー情報を取得
      const user = await this.userService.getUserById(session.userId)

      return {
        sessionId,
        userId: session.userId,
        user,
      }
    } catch (error) {
      // セッション検証エラーの場合、Cookieをクリア
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(
        ErrorCodes.UNAUTHORIZED,
        '認証に失敗しました',
        401
      )
    }
  }

  /**
   * セッションCookieを設定
   */
  setSessionCookie(sessionId: string): string {
    const options = this.sessionService.getSessionCookieOptions()
    return serialize('sessionId', sessionId, options)
  }

  /**
   * セッションCookieをクリア
   */
  clearSessionCookie(): string {
    return serialize('sessionId', '', {
      maxAge: 0,
      path: '/',
    })
  }
}
