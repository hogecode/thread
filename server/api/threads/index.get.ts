import { SessionAuth } from '../../utils/sessionAuth'
import { handleError, successResponse } from '../../utils/errorHandler'
import { getDB, schema } from '../../db'
import { eq, and, isNull } from 'drizzle-orm'

/**
 * GET /api/threads
 * スレッド一覧取得エンドポイント
 * ページネーション対応
 */
export default defineEventHandler(async (event) => {
  try {
    // クエリパラメータを取得
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const categoryId = query.categoryId ? parseInt(query.categoryId as string) : undefined

    // バリデーション
    if (page < 1) {
      throw new Error('page must be greater than 0')
    }
    if (limit < 1 || limit > 100) {
      throw new Error('limit must be between 1 and 100')
    }

    const db = await getDB()
    const offset = (page - 1) * limit

    // WHERE条件を構築
    let whereConditions: any[] = [isNull(schema.threads.isDeleted)]
    if (categoryId) {
      whereConditions.push(eq(schema.threads.categoryId, categoryId))
    }

    // スレッド一覧を取得（最新順）
    const threads = await db
      .select()
      .from(schema.threads)
      .where(and(...whereConditions))
      .orderBy(schema.threads.createdAt)
      .limit(limit)
      .offset(offset)

    // 総数を取得
    const countResult = await db
      .select({ count: schema.threads.id })
      .from(schema.threads)
      .where(and(...whereConditions))

    const total = countResult.length || 0
    const totalPages = Math.ceil(total / limit)

    setResponseStatus(event, 200)
    return successResponse({
      threads,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error) {
    const { response, status } = handleError(error)
    setResponseStatus(event, status)
    return response
  }
})
