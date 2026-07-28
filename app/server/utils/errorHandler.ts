import type { ApiResponse } from '../types'
import { AppError } from '../types'

/**
 * エラーハンドリングユーティリティ
 */

/**
 * エラーをAPIレスポンスに変換
 */
export function handleError(error: any): { response: ApiResponse; status: number } {
  // AppErrorの場合
  if (error instanceof AppError) {
    return {
      response: {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      status: error.statusCode,
    }
  }

  // その他のエラーの場合
  console.error('Unexpected error:', error)
  return {
    response: {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'サーバーエラーが発生しました',
      },
    },
    status: 500,
  }
}

/**
 * 成功レスポンスを作成
 */
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
  }
}

/**
 * エラーレスポンスを作成
 */
export function errorResponse(code: string, message: string): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
    },
  }
}
