// ============ Authentication & User Types ============

export interface CreateUserInput {
  username: string
  email: string
  password: string
}

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

export interface SessionData {
  id: number
  sessionId: string
  userId: number
  expiresAt: Date
  createdAt: Date
  user?: UserData
}

export interface AuthContext {
  sessionId: string
  userId: number
  user: UserData
}