'use client'

import type { VercelTelemetryFlags } from './flags'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export function VercelTelemetry({
  analyticsEnabled,
  speedInsightsEnabled,
}: VercelTelemetryFlags) {
  return (
    <>
      {analyticsEnabled && <Analytics />}
      {speedInsightsEnabled && <SpeedInsights />}
    </>
  )
}
