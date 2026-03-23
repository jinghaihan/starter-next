import process from 'node:process'

export interface VercelTelemetryFlags {
  analyticsEnabled: boolean
  speedInsightsEnabled: boolean
}

function parseBooleanEnv(value: string | undefined): boolean {
  return value === 'true'
}

export function getVercelTelemetryFlags(): VercelTelemetryFlags {
  return {
    analyticsEnabled: parseBooleanEnv(process.env.VERCEL_ANALYTICS_ENABLED),
    speedInsightsEnabled: parseBooleanEnv(process.env.VERCEL_SPEED_INSIGHTS_ENABLED),
  }
}
