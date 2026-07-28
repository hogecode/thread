import { SessionAuth } from '../../middleware/sessionAuth'
import { handleError, successResponse } from '../../utils/errorHandler'

/**
 * GET /api/user/profile
 * 現在のユーザープロフィール取得エンドポイント
 * セッション検証が必須
 */
export default defineEventHandler(async (event) => {
  try {
    // セッション認証
    const sessionAuth = await SessionAuth.create()
    const authContext = await sessionAuth.validateFromRequest(event)

    // ユーザー情報をレスポンス
    setResponseStatus(event, 200)
    return successResponse(authContext.user)
  } catch (error) {
    // エラーハンドリング
    const { response, status } = handleError(error)
    setResponseStatus(event, status)
    return response
  }
})
