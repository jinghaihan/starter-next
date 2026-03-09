import { boolean, index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { user } from './auth'

export const payment = pgTable(
  'payment',
  {
    id: text('id').primaryKey(),
    priceId: text('price_id').notNull(),
    type: text('type').notNull(),
    interval: text('interval'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    customerId: text('customer_id').notNull(),
    subscriptionId: text('subscription_id'),
    sessionId: text('session_id'),
    status: text('status').notNull(),
    periodStart: timestamp('period_start'),
    periodEnd: timestamp('period_end'),
    cancelAtPeriodEnd: boolean('cancel_at_period_end'),
    trialStart: timestamp('trial_start'),
    trialEnd: timestamp('trial_end'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  table => [
    index('payment_user_id_idx').on(table.userId),
    index('payment_customer_id_idx').on(table.customerId),
    index('payment_status_idx').on(table.status),
    index('payment_price_id_idx').on(table.priceId),
    uniqueIndex('payment_subscription_id_unique').on(table.subscriptionId),
    uniqueIndex('payment_session_id_unique').on(table.sessionId),
  ],
)
