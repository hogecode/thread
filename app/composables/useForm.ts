/**
 * フォーム状態管理 Composable
 */
export function useForm<T extends Record<string, any>>(initialValues: T) {
  const values = reactive<T>({ ...initialValues })
  const errors = reactive<Record<string, string>>({})
  const touched = reactive<Record<string, boolean>>({})

  /**
   * フィールドの値を更新
   */
  const setFieldValue = (field: keyof T, value: any) => {
    values[field as string] = value
    touched[field as string] = true
  }

  /**
   * フィールドのエラーを設定
   */
  const setFieldError = (field: keyof T, error: string) => {
    errors[field as string] = error
  }

  /**
   * すべてのエラーを設定
   */
  const setErrors = (newErrors: Record<string, string>) => {
    Object.assign(errors, newErrors)
  }

  /**
   * フォームをリセット
   */
  const resetForm = () => {
    Object.assign(values, initialValues)
    Object.keys(errors).forEach(key => delete errors[key])
    Object.keys(touched).forEach(key => delete touched[key])
  }

  /**
   * 特定フィールドのエラーを取得
   */
  const getFieldError = (field: keyof T): string | undefined => {
    const fieldKey = field as string
    return touched[fieldKey] ? errors[fieldKey] : undefined
  }

  return {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldError,
    setErrors,
    resetForm,
    getFieldError,
  }
}
