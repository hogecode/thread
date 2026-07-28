<script setup lang="ts">
import { useForm } from 'vee-validate'
import { useAuthStore } from '~/stores/auth'
import * as yup from 'yup'
import { ref } from 'vue'

definePageMeta({
  layout: 'default',
})

const authStore = useAuthStore()
const router = useRouter()

// useFetchの戻り値を保持
let loginResult: any = null

/**
 * ログイン フォームバリデーションスキーマ
 */
const loginValidationSchema = yup.object({
  email: yup
    .string()
    .required('メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),
  password: yup
    .string()
    .required('パスワードは必須です'),
})

// VeeValidateフォーム初期化
const { values, errors, handleSubmit, resetForm } = useForm({
  validationSchema: loginValidationSchema,
  initialValues: {
    email: '',
    password: '',
  },
})

/**
 * エラーをクリア
 */
const clearError = () => {
  if (loginResult?.error) {
    loginResult.error.value = null
  }
}

/**
 * フォーム送信
 */
const onSubmit = handleSubmit(async (formValues) => {
  try {
    loginResult = await authStore.login(formValues.email, formValues.password)
    
    if (!loginResult.error?.value && loginResult.success) {
      // ログイン成功 → プロフィールページへリダイレクト
      await navigateTo('/profile')
    }
  } catch (err: any) {
    console.error('ログインエラー:', err)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <!-- ヘッダー -->
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          ログイン
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          または
          <NuxtLink
            to="/register"
            class="font-medium text-blue-600 hover:text-blue-500"
          >
            アカウント作成
          </NuxtLink>
        </p>
      </div>

      <!-- フォーム -->
      <form @submit="onSubmit" class="mt-8 space-y-6">
        <!-- エラーメッセージ -->
        <UAlert
          v-if="loginResult?.error?.value"
          icon="i-heroicons-exclamation-triangle"
          color="error"
          title="エラー"
          :description="loginResult.error.value.message || 'ログインに失敗しました'"
          @close="clearError()"
        />

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
            autocomplete="current-password"
            placeholder="••••••••"
            class="mt-1"
          />
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">
            {{ errors.password }}
          </p>
        </div>

        <!-- ログインボタン -->
        <div>
          <UButton
            type="submit"
            block
            size="lg"
            :loading="loginResult?.pending?.value"
            :disabled="loginResult?.pending?.value"
          >
            ログイン
          </UButton>
        </div>
      </form>
    </div>
  </div>
</template>
