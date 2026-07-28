import { AppError, ErrorCodes } from '../types'

/**
 * バリデーションクラス
 * 入力値の検証を管理
 */
export class Validator {
  /**
   * メールアドレスを検証
   */
  validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        '有効なメールアドレスを入力してください',
        400
      )
    }
  }

  /**
   * ユーザー名を検証
   */
  validateUsername(username: string): void {
    if (username.length < 3 || username.length > 50) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'ユーザー名は3〜50文字である必要があります',
        400
      )
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(username)) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'ユーザー名に使用できるのは英数字、アンダースコア、ハイフンのみです',
        400
      )
    }
  }

  /**
   * パスワードを検証
   */
  validatePassword(password: string): void {
    if (password.length < 8 || password.length > 255) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'パスワードは8〜255文字である必要があります',
        400
      )
    }

    // 複雑さの要件チェック
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /[0-9]/.test(password)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'パスワードは大文字、小文字、数字を含む必要があります',
        400
      )
    }
  }

  /**
   * 登録フォームを検証
   */
  validateRegistrationForm(data: any): void {
    // メールアドレスが存在するか
    if (!data.email) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'メールアドレスは必須です',
        400
      )
    }

    // ユーザー名が存在するか
    if (!data.username) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'ユーザー名は必須です',
        400
      )
    }

    // パスワードが存在するか
    if (!data.password) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'パスワードは必須です',
        400
      )
    }

    // 各フィールドを検証
    this.validateEmail(data.email)
    this.validateUsername(data.username)
    this.validatePassword(data.password)
  }

  /**
   * ログインフォームを検証
   */
  validateLoginForm(data: any): void {
    // メールアドレスが存在するか
    if (!data.email) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'メールアドレスは必須です',
        400
      )
    }

    // パスワードが存在するか
    if (!data.password) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'パスワードは必須です',
        400
      )
    }

    // メールアドレスを検証
    this.validateEmail(data.email)
  }
}
