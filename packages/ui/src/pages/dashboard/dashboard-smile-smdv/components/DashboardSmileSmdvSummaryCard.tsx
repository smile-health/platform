import { useMemo } from 'react'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import {
  DefaultDashboardSelection,
  getDefaultSummaryCardDashboard,
  SummaryCardId,
} from '../dashboard-smile-smdv.constant'
import { SmileVsSmdvSummaryResponse } from '../dashboard-smile-smdv.type'

export type Props = Readonly<{
  data?: SmileVsSmdvSummaryResponse
  defaultDashboard?: DefaultDashboardSelection
}>

export type SummaryCard = {
  id: string
  label: string
  color: string
  total?: number
}

export default function DashboardSmileSmdvSummaryCard(props: Props) {
  const { data, defaultDashboard } = props
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardSmileSmdv')

  const summaryCards: SummaryCard[] = useMemo(
    () =>
      getDefaultSummaryCardDashboard(t, defaultDashboard)?.map((card) => {
        return {
          ...card,
          total: data?.[card.id] ?? undefined,
        }
      }),
    [t, data]
  )

  return (
    <div className="ui-pt-1 ui-grid ui-grid-cols-3 gap-4">
      {summaryCards?.map((card) => (
        <div
          key={card.id}
          className="ui-rounded ui-p-4 ui-h-[8.5rem]"
          style={{ backgroundColor: card.color }}
        >
          <p className="ui-font-medium ui-text-neutral-700 ui-text-sm ui-line-clamp-3">
            {card.label}
          </p>
          <p className="ui-text-3xl ui-font-bold ui-text-neutral-900 ui-mb-2">
            {card.total !== undefined
              ? numberFormatter(card.total, language)
              : '-'}
          </p>
          {card?.id === SummaryCardId.QTY_DEVIATION &&
            card?.total !== undefined &&
            card?.total < 0 && (
              <p className="ui-text-sm !ui-text-red-600">
                <span className="ui-font-bold">
                  {t('summary.qty_deviation.negative_values')}
                </span>
                {t('summary.qty_deviation.message', {
                  symbol:
                    defaultDashboard === DefaultDashboardSelection.SMDV_VS_SMILE
                      ? '>'
                      : '<',
                })}
              </p>
            )}
        </div>
      ))}
    </div>
  )
}
