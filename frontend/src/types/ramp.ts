export type RampStatus = 'open' | 'closed' | 'unknown'

export interface RampStatusResponse {
  status: RampStatus
  label: string
  reopening_date: string | null
  reopening_time: string | null
  reopening_date_display: string | null
  river_flow: string | null
  ramp_info: string | null
  source_url: string
  fetched_at: string
  excerpt: string | null
}
