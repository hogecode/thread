import { hash, compare } from 'bcrypt'
import type { CreateUserInput, UserData } from '../types'
import { AppError, ErrorCodes } from '../types'
import { UserRepository } from '../repository/userRepository'

/**
 * ユーザーサービス
 * ユーザー関連のビジネスロジックを担当
 */
export class UserService {
  private userRepository: UserRepository

  private constructor(userRepository: UserRepository) {
    this.userRepository = userRepository
  }

  /**
   * UserServiceのインスタンスを作成（非同期ファクトリパターン）
   */
  static async create(): Promise<UserService> {
    const userRepository = await UserRepository.create()
    return new UserService(userRepository)
  }

  /**
   * ユーザー登録
   */
  async register(data: CreateUserInput): Promise<UserData> {
    // メールアドレスが既に使用されているかチェック
    const existingEmail = await this.userRepository.findByEmail(data.email)
    if (existingEmail) {
      throw new AppError(
        ErrorCodes.USER_ALREADY_EXISTS,
        'このメールアドレスは既に登録されています',
        409
      )
    }

    // ユーザー名が既に使用されているかチェック
    const existingUsername = await this.userRepository.findByUsername(data.username)
    if (existingUsername) {
      throw new AppError(
        ErrorCodes.USER_ALREADY_EXISTS,
        'このユーザー名は既に使用されています',
        409
      )
    }

    // パスワードをハッシュ化
    const passwordHash = await hash(data.password, 10)

    // ユーザーを作成
    const user = await this.userRepository.create({
      ...data,
      passwordHash,
    })

    if (!user) {
      throw new AppError(
        ErrorCodes.INTERNAL_ERROR,
        'ユーザー作成に失敗しました',
        500
      )
    }

    return this.userRepository.formatUserData(user)
  }

  /**
   * ログイン検証
   */
  async validateLogin(email: string, password: string): Promise<UserData> {
    // メールアドレスでユーザーを検索
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      throw new AppError(
        ErrorCodes.INVALID_CREDENTIALS,
        'メールアドレスまたはパスワードが無効です',
        401
      )
    }

    // ユーザーがアクティブかチェック
    if (!user.isActive) {
      throw new AppError(
        ErrorCodes.INVALID_CREDENTIALS,
        'このアカウントは無効化されています',
        403
      )
    }

    // パスワードを検証
    const isPasswordValid = await compare(password, user.passwordHash)
    if (!isPasswordValid) {
      throw new AppError(
        ErrorCodes.INVALID_CREDENTIALS,
        'メールアドレスまたはパスワードが無効です',
        401
      )
    }

    return this.userRepository.formatUserData(user)
  }

  /**
   * IDでユーザーを取得
   */
  async getUserById(id: number): Promise<UserData> {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new AppError(
        ErrorCodes.USER_NOT_FOUND,
        'ユーザーが見つかりません',
        404
      )
    }

    return this.userRepository.formatUserData(user)
  }
}
