import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { ref } from 'vue'

export interface UserData {
  id: number
  username: string
  email: string
  isActive: boolean
  isAdmin: boolean
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * 認証ストア
 * ユーザー状態とセッション情報を管理
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<UserData | null>(null)
  const isAuthenticated = ref(false)

  // Actions
  /**
   * ユーザー登録
   */
  const register = async (email: string, username: string, password: string) => {
    const { data: response, pending, error: fetchError } = await useFetch<any>('/api/auth/register', {
      method: 'POST',
      body: {
        email,
        username,
        password,
      },
    })

    if (response?.value?.success && response?.value?.data?.user) {
      user.value = response.value.data.user
      isAuthenticated.value = true
    }

    return { success: response?.value?.success, pending, error: fetchError }
  }

  /**
   * ログイン
   */
  const login = async (email: string, password: string) => {
    const { data: response, pending, error: fetchError } = await useFetch<any>('/api/auth/login', {
      method: 'POST',
      body: {
        email,
        password,
      },
    })

    if (response?.value?.success && response?.value?.data?.user) {
      user.value = response.value.data.user
      isAuthenticated.value = true
    }

    return { success: response?.value?.success, pending, error: fetchError }
  }

  /**
   * ログアウト
   */
  const logout = async () => {
    const { pending, error: fetchError } = await useFetch('/api/auth/logout', {
      method: 'POST',
    })

    user.value = null
    isAuthenticated.value = false

    return { success: true, pending, error: fetchError }
  }

  /**
   * プロフィール取得
   */
  const fetchProfile = async () => {
    const { data: response, pending, error: fetchError } = await useFetch<any>('/api/user/profile', {
      method: 'GET',
    })

    if (response?.value?.success && response?.value?.data) {
      user.value = response.value.data
      isAuthenticated.value = true
    } else {
      isAuthenticated.value = false
    }

    return { success: response?.value?.success, pending, error: fetchError }
  }

  /**
   * ストアをリセット
   */
  const reset = () => {
    user.value = null
    isAuthenticated.value = false
  }

  return {
    // State
    user,
    isAuthenticated,

    // Actions
    register,
    login,
    logout,
    fetchProfile,
    reset,
  }
})
