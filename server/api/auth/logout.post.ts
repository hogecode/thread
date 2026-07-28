import { SessionAuth } from '../../utils/sessionAuth'
import { handleError, successResponse } from '../../utils/errorHandler'

/**
 * POST /api/auth/logout
 * ログアウトエンドポイント
 */
export default defineEventHandler(async (event) => {
  try {
    // セッション認証ミドルウェアを初期化
    const sessionAuth = await SessionAuth.create()

    // セッションCookieをクリア
    const clearCookieHeader = sessionAuth.clearSessionCookie()

    // Cookieをヘッダーに設定
    appendHeader(event, 'Set-Cookie', clearCookieHeader)

    // レスポンスを返す
    setResponseStatus(event, 200)
    return successResponse(null, 'ログアウトしました')
  } catch (error) {
    // エラーハンドリング
    const { response, status } = handleError(error)
    setResponseStatus(event, status)
    return response
  }
})
