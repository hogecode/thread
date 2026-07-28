<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <!-- ヘッダー -->
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          アカウントを作成
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          または
          <NuxtLink
            to="/login"
            class="font-medium text-blue-600 hover:text-blue-500"
          >
            ログイン
          </NuxtLink>
        </p>
      </div>

      <!-- フォーム -->
      <form @submit.prevent="handleSubmit" class="mt-8 space-y-6">
        <!-- エラーメッセージ -->
        <UAlert
          v-if="authStore.error"
          icon="i-heroicons-exclamation-triangle"
          color="error"
          title="エラー"
          :description="authStore.error"
          @close="authStore.clearError()"
        />

        <!-- ユーザー名 -->
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">
            ユーザー名
          </label>
          <UInput
            id="username"
            v-model="form.values.username"
            type="text"
            autocomplete="username"
            placeholder="john_doe"
            class="mt-1"
            @blur="() => (form.touched.username = true)"
          />
          <p v-if="form.getFieldError('username')" class="mt-1 text-sm text-red-600">
            {{ form.getFieldError('username') }}
          </p>
        </div>

        <!-- メールアドレス -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <UInput
            id="email"
            v-model="form.values.email"
            type="email"
            autocomplete="email"
            placeholder="john@example.com"
            class="mt-1"
            @blur="() => (form.touched.email = true)"
          />
          <p v-if="form.getFieldError('email')" class="mt-1 text-sm text-red-600">
            {{ form.getFieldError('email') }}
          </p>
        </div>

        <!-- パスワード -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">
            パスワード
          </label>
          <UInput
            id="password"
            v-model="form.values.password"
            type="password"
            autocomplete="new-password"
            placeholder="••••••••"
            class="mt-1"
            @blur="() => (form.touched.password = true)"
          />
          <p v-if="form.getFieldError('password')" class="mt-1 text-sm text-red-600">
            {{ form.getFieldError('password') }}
          </p>
        </div>

        <!-- 登録ボタン -->
        <div>
          <UButton
            type="submit"
            block
            size="lg"
            :loading="authStore.isLoading"
            :disabled="authStore.isLoading"
          >
            アカウントを作成
          </UButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useForm } from '~/composables/useForm'

definePageMeta({
  layout: 'default',
})

const authStore = useAuthStore()
const router = useRouter()

// フォーム状態
const form = useForm({
  username: '',
  email: '',
  password: '',
})

/**
 * フォーム送信
 */
const handleSubmit = async () => {
  // バリデーション
  const newErrors: Record<string, string> = {}

  if (!form.values.username) {
    newErrors.username = 'ユーザー名は必須です'
  } else if (form.values.username.length < 3) {
    newErrors.username = 'ユーザー名は3文字以上である必要があります'
  }

  if (!form.values.email) {
    newErrors.email = 'メールアドレスは必須です'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.values.email)) {
    newErrors.email = '有効なメールアドレスを入力してください'
  }

  if (!form.values.password) {
    newErrors.password = 'パスワードは必須です'
  } else if (form.values.password.length < 8) {
    newErrors.password = 'パスワードは8文字以上である必要があります'
  }

  if (Object.keys(newErrors).length > 0) {
    form.setErrors(newErrors)
    return
  }

  // 登録実行
  const success = await authStore.register(
    form.values.email,
    form.values.username,
    form.values.password
  )

  if (success) {
    // 登録成功 → プロフィールページへリダイレクト
    await navigateTo('/profile')
  }
}
</script>
