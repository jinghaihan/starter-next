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

  async getLatestSubscriptionByUserId(userId: string) {
    const rows = await db
      .select({
        priceId: payment.priceId,
        status: payment.status,
        periodStart: payment.periodStart,
        periodEnd: payment.periodEnd,
        cancelAtPeriodEnd: payment.cancelAtPeriodEnd,
      })
      .from(payment)
      .where(and(
        eq(payment.userId, userId),
        eq(payment.type, 'subscription'),
      ))
      .orderBy(desc(payment.createdAt))
      .limit(1)

    return rows[0] ?? null
  }

  async hasCompletedOneTimePaymentByPriceId(userId: string, priceId: string): Promise<boolean> {
    const rows = await db
      .select({ id: payment.id })
      .from(payment)
      .where(and(
        eq(payment.userId, userId),
        eq(payment.type, 'one_time'),
        eq(payment.status, 'completed'),
        eq(payment.priceId, priceId),
      ))
      .limit(1)

    return rows.length > 0
  }
}

export const billingService = new BillingService()
