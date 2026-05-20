export type RampStatus = 'open' | 'closed' | 'unknown'

export interface RampStatusResponse {
  status: RampStatus
  label: string
  reopening_date: string | null
  reopening_date_display: string | null
  source_url: string
  fetched_at: string
  excerpt: string | null
}
