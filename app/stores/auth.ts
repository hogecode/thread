import { defineStore } from 'pinia'
import type { UserData } from '~/server/types'

/**
 * 認証ストア
 * ユーザー状態とセッション情報を管理
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<UserData | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  /**
   * ユーザー登録
   */
  const register = async (email: string, username: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<any>('/api/auth/register', {
        method: 'POST',
        body: {
          email,
          username,
          password,
        },
      })

      if (response?.success && response?.data?.user) {
        user.value = response.data.user
        isAuthenticated.value = true
        return true
      } else {
        error.value = response?.error?.message || '登録に失敗しました'
        return false
      }
    } catch (err: any) {
      error.value = err?.data?.error?.message || 'エラーが発生しました'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * ログイン
   */
  const login = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<any>('/api/auth/login', {
        method: 'POST',
        body: {
          email,
          password,
        },
      })

      if (response?.success && response?.data?.user) {
        user.value = response.data.user
        isAuthenticated.value = true
        return true
      } else {
        error.value = response?.error?.message || 'ログインに失敗しました'
        return false
      }
    } catch (err: any) {
      error.value = err?.data?.error?.message || 'エラーが発生しました'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * ログアウト
   */
  const logout = async () => {
    isLoading.value = true
    error.value = null

    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
      })

      user.value = null
      isAuthenticated.value = false
      return true
    } catch (err: any) {
      error.value = err.data?.error?.message || 'ログアウトに失敗しました'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * プロフィール取得
   */
  const fetchProfile = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<any>('/api/user/profile', {
        method: 'GET',
      })

      if (response?.success && response?.data) {
        user.value = response.data
        isAuthenticated.value = true
        return true
      } else {
        error.value = response?.error?.message || 'プロフィール取得に失敗しました'
        isAuthenticated.value = false
        return false
      }
    } catch (err: any) {
      error.value = err?.data?.error?.message || 'エラーが発生しました'
      isAuthenticated.value = false
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * エラーをクリア
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * ストアをリセット
   */
  const reset = () => {
    user.value = null
    isAuthenticated.value = false
    isLoading.value = false
    error.value = null
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    register,
    login,
    logout,
    fetchProfile,
    clearError,
    reset,
  }
})
