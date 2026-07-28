<script setup lang="ts">
import { useForm } from 'vee-validate'
import { useAuthStore } from '~/stores/auth'
import * as yup from 'yup'

definePageMeta({
  layout: 'default',
})

const authStore = useAuthStore()
const router = useRouter()

// useFetchの戻り値を保持
let registerResult: any = null

/**
 * 登録フォームバリデーションスキーマ
 */
const registerValidationSchema = yup.object({
  username: yup
    .string()
    .required('ユーザー名は必須です')
    .min(3, 'ユーザー名は3文字以上である必要があります'),
  email: yup
    .string()
    .required('メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),
  password: yup
    .string()
    .required('パスワードは必須です')
    .min(8, 'パスワードは8文字以上である必要があります'),
})

// VeeValidateフォーム初期化
const { values, errors, handleSubmit, resetForm } = useForm({
  validationSchema: registerValidationSchema,
  initialValues: {
    username: '',
    email: '',
    password: '',
  },
})

/**
 * エラーをクリア
 */
const clearError = () => {
  if (registerResult?.error) {
    registerResult.error.value = null
  }
}

/**
 * フォーム送信
 */
const onSubmit = handleSubmit(async (formValues) => {
  try {
    registerResult = await authStore.register(
      formValues.email,
      formValues.username,
      formValues.password
    )
    
    if (!registerResult.error?.value && registerResult.success) {
      // 登録成功 → プロフィールページへリダイレクト
      await navigateTo('/profile')
    }
  } catch (err: any) {
    console.error('登録エラー:', err)
  }
})
</script>

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
      <form @submit="onSubmit" class="mt-8 space-y-6">
        <!-- エラーメッセージ -->
        <UAlert
          v-if="registerResult?.error?.value"
          icon="i-heroicons-exclamation-triangle"
          color="error"
          title="エラー"
          :description="registerResult.error.value.message || '登録に失敗しました'"
          @close="clearError()"
        />

        <!-- ユーザー名 -->
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">
            ユーザー名
          </label>
          <UInput
            id="username"
            v-model="values.username"
            type="text"
            autocomplete="username"
            placeholder="john_doe"
            class="mt-1"
          />
          <p v-if="errors.username" class="mt-1 text-sm text-red-600">
            {{ errors.username }}
          </p>
        </div>

        <!-- メールアドレス -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <UInput
            id="email"
            v-model="values.email"
            type="email"
            autocomplete="email"
            placeholder="john@example.com"
            class="mt-1"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-600">
            {{ errors.email }}
          </p>
        </div>

        <!-- パスワード -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">
            パスワード
          </label>
          <UInput
            id="password"
            v-model="values.password"
            type="password"
            autocomplete="new-password"
            placeholder="••••••••"
            class="mt-1"
          />
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">
            {{ errors.password }}
          </p>
        </div>

        <!-- 登録ボタン -->
        <div>
          <UButton
            type="submit"
            block
            size="lg"
            :loading="registerResult?.pending?.value"
            :disabled="registerResult?.pending?.value"
          >
            アカウントを作成
          </UButton>
        </div>
      </form>
    </div>
  </div>
</template>
