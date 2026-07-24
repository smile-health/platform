import React from 'react'
import { useTranslation } from 'react-i18next'

import { TBmhpApprovalMinistrySummary } from '../libs/bmhp-approval-ministry.type'

type Props = {
  summary: TBmhpApprovalMinistrySummary
}

const SummaryCard = ({
  title,
  value,
  subtitle,
  dailySubmissions,
  valueClassName,
}: {
  title: string
  value: string | number
  subtitle?: string
  dailySubmissions?: number | null
  valueClassName?: string
}) => {
  let subText = null

  if (dailySubmissions != null) {
    subText = (
      <p className="ui-text-xs ui-text-green-700 ui-mt-0.5 ui-truncate font-bold">
        + {dailySubmissions} hari ini
      </p>
    )
  } else if (subtitle) {
    subText = (
      <p className="ui-text-xs ui-text-neutral-400 ui-mt-0.5 ui-truncate">
        {subtitle}
      </p>
    )
  }

  return (
    <div className="ui-border ui-border-gray-200 ui-rounded ui-p-3 ui-flex-1 ui-min-w-0">
      <p className="ui-text-xs ui-text-neutral-500 ui-truncate">{title}</p>
      <p
        className={`ui-text-xl ui-font-bold ui-mt-1 ${valueClassName ?? 'ui-text-gray-900'}`}
      >
        {value}
      </p>
      {subText}
    </div>
  )
}

const BmhpApprovalMinistrySummaryCards: React.FC<Props> = ({ summary }) => {
  const { t } = useTranslation(['bmhpApproval'])

  return (
    <div className="ui-flex ui-gap-3 ui-flex-wrap">
      <SummaryCard
        title={t('bmhpApproval:ministry.summary.total_provinces')}
        value={summary.total_provinces ?? '-'}
        subtitle={t('bmhpApproval:ministry.summary.national_target')}
      />
      <SummaryCard
        title={t('bmhpApproval:ministry.summary.submitted')}
        value={summary.submitted ?? '-'}
        dailySubmissions={summary.daily_submissions}
      />
      <SummaryCard
        title={t('bmhpApproval:ministry.summary.not_submitted')}
        value={summary.not_submitted ?? '-'}
        subtitle={t('bmhpApproval:ministry.summary.needs_followup')}
      />
      <SummaryCard
        title={t('bmhpApproval:ministry.summary.percentage_solution', { defaultValue: 'Persentase Penyelesaian' })}
        value={summary.percentage_solution != null ? `${summary.percentage_solution}%` : '-'}
      />
    </div>
  )
}

export default BmhpApprovalMinistrySummaryCards
