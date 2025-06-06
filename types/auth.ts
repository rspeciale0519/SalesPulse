export type AuthView = "login" | "signup" | "forgot-password" | "2fa"
export type TwoFactorAuthMethod = "sms" | "email" | "authenticator_app"

export interface User {
  id: string
  email: string
  isTwoFactorEnabled: boolean
  twoFactorMethod: TwoFactorAuthMethod | null
}
