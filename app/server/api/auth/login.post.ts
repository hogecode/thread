import type { LoginResponse } from '../../types'
import { UserService } from '../../service/userService'
import { SessionService } from '../../service/sessionService'
import { SessionAuth } from '../../middleware/sessionAuth'
import { Validator } from '../../utils/validation'
import { handleError, successResponse } from '../../utils/errorHandler'

/**
 * POST /api/auth/login
 * ログインエンドポイント
 */
export default defineEventHandler(async (event) => {
  try {
    // リクエストボディを取得
    const body = await readBody(event)

    // バリデーション
    const validator = new Validator()
    validator.validateLoginForm(body)

    // サービスのインスタンス化
    const userService = await UserService.create()
    const sessionService = await SessionService.create()

    // ログイン認証
    const user = await userService.validateLogin(body.email, body.password)

    // セッションを作成
    const session = await sessionService.createSession(user.id)

    // セッションCookieを設定
    const sessionAuth = await SessionAuth.create()
    const setCookieHeader = sessionAuth.setSessionCookie(session.sessionId)

    // Cookieをヘッダーに設定
    appendHeader(event, 'Set-Cookie', setCookieHeader)

    // レスポンスを返す
    const response: LoginResponse = {
      user,
      message: 'ログインしました',
    }

    setResponseStatus(event, 200)
    return successResponse(response)
  } catch (error) {
    // エラーハンドリング
    const { response, status } = handleError(error)
    setResponseStatus(event, status)
    return response
  }
})
