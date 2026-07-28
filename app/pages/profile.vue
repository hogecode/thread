<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
})

const authStore = useAuthStore()
const router = useRouter()

// useFetchの戻り値を保持
let profileResult: any = null
let logoutResult: any = null

/**
 * 日付をフォーマット
 */
const formatDate = (date: any) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * ログアウト処理
 */
const handleLogout = async () => {
  try {
    logoutResult = await authStore.logout()

    if (!logoutResult.error?.value && logoutResult.success) {
      // ログアウト成功 → ログインページへリダイレクト
      await navigateTo('/login')
    }
  } catch (err: any) {
    console.error('ログアウトエラー:', err)
  }
}

/**
 * マウント時にプロフィール取得
 */
onMounted(async () => {
  try {
    // 既に認証済みでユーザー情報がある場合はそのまま使用
    if (authStore.user) {
      return
    }

    // ない場合は取得
    profileResult = await authStore.fetchProfile()
  } catch (err: any) {
    console.error('Failed to fetch profile:', err)
  }

  // 認証されていない場合はログインページへリダイレクト
  if (!authStore.isAuthenticated || !authStore.user) {
    await navigateTo('/login')
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto">
      <!-- ローディング -->
      <div v-if="profileResult?.pending?.value" class="flex justify-center">
        <USkeleton class="h-12 w-64" />
      </div>

      <!-- プロフィール -->
      <div v-else-if="authStore.user" class="bg-white rounded-lg shadow px-4 py-5 sm:px-6">
        <!-- ヘッダー -->
        <div class="mb-6 pb-6 border-b border-gray-200">
          <h1 class="text-3xl font-bold text-gray-900">
            こんにちは、{{ authStore.user.username }}さん
          </h1>
          <p class="mt-2 text-gray-600">
            プロフィール
          </p>
        </div>

        <!-- ユーザー情報 -->
        <div class="space-y-6">
          <!-- ユーザー名 -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              ユーザー名
            </label>
            <p class="mt-1 text-gray-900">
              {{ authStore.user.username }}
            </p>
          </div>

          <!-- メールアドレス -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <p class="mt-1 text-gray-900">
              {{ authStore.user.email }}
            </p>
          </div>

          <!-- ステータス -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              ステータス
            </label>
            <div class="mt-1 flex items-center">
              <UBadge
                :color="authStore.user.isActive ? 'success' : 'error'"
              >
                {{ authStore.user.isActive ? 'アクティブ' : '無効' }}
              </UBadge>
            </div>
          </div>

          <!-- 登録日時 -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              登録日時
            </label>
            <p class="mt-1 text-gray-900">
              {{ formatDate(authStore.user.createdAt) }}
            </p>
          </div>
        </div>

        <!-- アクション -->
        <div class="mt-8 pt-6 border-t border-gray-200 space-y-3">
          <UButton
            @click="handleLogout"
            :loading="logoutResult?.pending?.value"
            :disabled="logoutResult?.pending?.value"
            color="error"
            block
          >
            ログアウト
          </UButton>
        </div>
      </div>

      <!-- エラー表示 -->
      <div v-else class="text-center">
        <UAlert
          icon="i-heroicons-exclamation-triangle"
          color="error"
          title="エラー"
          :description="profileResult?.error?.value?.message || 'プロフィールの読み込みに失敗しました'"
        />
        <div class="mt-4">
          <NuxtLink to="/login" class="text-blue-600 hover:text-blue-500">
            ログインページへ戻る
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
