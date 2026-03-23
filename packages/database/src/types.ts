import type {
  account,
  session,
  user,
  verification,
} from './schemas/auth'
import type { payment } from './schemas/payment'

export interface Resetable {
  reset: () => Promise<void>
}

export type DatabaseAccount = typeof account.$inferSelect
export type DatabasePayment = typeof payment.$inferSelect
export type DatabaseSession = typeof session.$inferSelect
export type DatabaseUser = typeof user.$inferSelect
export type DatabaseVerification = typeof verification.$inferSelect
