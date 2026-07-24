// ── Shared Types for Province Monitoring Tabs ─────────────────────────────────────

export type ScreeningType = string

export interface ScreeningSummaryData {
  label: string
  totals: number[]
}

export interface MonitoringCardProps {
  title: string
  children: React.ReactNode
  buttons?: MonitoringCardButton[]
  tableContainerClassName?: string
}

export interface MonitoringCardWithFilterProps extends Omit<MonitoringCardProps, 'tableContainerClassName'> {
  filter?: React.ReactNode
  tableContainerClassName?: string
}

export interface MonitoringCardButton {
  label: string
  icon?: React.ReactNode
  variant?: 'primary' | 'secondary'
  onClick?: () => void
}

export interface ScreeningSummaryTableProps {
  data: ScreeningSummaryData
  screeningTypes: readonly ScreeningType[]
  rowLabel?: string
}
