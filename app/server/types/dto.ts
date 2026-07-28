// ============ API Response Types ============
import type { UserData } from './auth'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

export interface LoginResponse {
  user: Omit<UserData, 'passwordHash'>
  message: string
}

export interface RegisterResponse {
  user: Omit<UserData, 'passwordHash'>
  message: string
}