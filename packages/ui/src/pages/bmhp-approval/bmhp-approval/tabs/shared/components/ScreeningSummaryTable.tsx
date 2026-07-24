'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'

import { ScreeningSummaryTableProps } from '../types/monitoring.types'

const ScreeningSummaryTable: React.FC<ScreeningSummaryTableProps> = ({
  data,
  screeningTypes,
  rowLabel = '',
}) => {
  const { t } = useTranslation(['bmhpApproval'])

  return (
    <div className="ui-overflow-x-auto">
      <table className="ui-w-full ui-border ui-border-neutral-200 ui-bg-white ui-rounded-lg">
        <thead>
          <tr className="ui-bg-neutral-50">
            <th className="ui-p-4 ui-text-left ui-text-sm ui-font-semibold ui-text-neutral-700 ui-border-b ui-border-neutral-200">
              {rowLabel || t('bmhpApproval:monitoring_card.screening_summary_table.label')}
            </th>
            {screeningTypes.map((type) => (
              <th
                key={type}
                className="ui-p-4 ui-text-center ui-text-sm ui-font-semibold ui-text-neutral-700 ui-border-b ui-border-neutral-200 ui-whitespace-nowrap"
              >
                {type}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="ui-bg-white hover:ui-bg-neutral-50">
            <td className="ui-p-4 ui-text-sm ui-font-medium ui-text-neutral-800 ui-border-b ui-border-neutral-200">
              {data.label}
            </td>
            {data.totals.map((total, idx) => (
              <td
                key={idx}
                className="ui-p-4 ui-text-sm ui-text-center ui-text-neutral-700 ui-border-b ui-border-neutral-200"
              >
                {total.toLocaleString('id-ID')}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default ScreeningSummaryTable
