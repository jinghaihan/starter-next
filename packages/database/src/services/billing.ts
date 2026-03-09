import { and, desc, eq, isNotNull } from 'drizzle-orm'
import { db } from '../db'
import { payment, user } from '../schemas'

class BillingService {
  async getUserEmailById(userId: string): Promise<string | null> {
    const rows = await db
      .select({ email: user.email })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    return rows[0]?.email ?? null
  }

  async getLatestCustomerIdByUserId(userId: string): Promise<string | null> {
    const rows = await db
      .select({ customerId: payment.customerId })
      .from(payment)
      .where(and(
        eq(payment.userId, userId),
        isNotNull(payment.customerId),
      ))
      .orderBy(desc(payment.createdAt))
      .limit(1)

    return rows[0]?.customerId ?? null
  }
}

export const billingService = new BillingService()
