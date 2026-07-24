import { ButtonIcon } from '#components/button-icon'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '#components/dropdown-menu'
import Download from '#components/icons/Download'
import { exportElement } from '#utils/download'

import '@radix-ui/react-dropdown-menu'

import { useQuery } from '@tanstack/react-query'
import { BarChart } from '#components/chart'
import { GlobalSpinner } from '#components/spinner'
import cx from '#lib/cx'
import dayjs from 'dayjs'
import { Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { DOWNLOAD_EXTENSIONS } from '../reconciliation.constant'
import { handleFilter } from '../reconciliation.helper'
import { getReconciliationSummary } from '../reconciliation.service'

type Props = Readonly<{
  filter: Values<Record<string, any>>
}>

export default function ReconciliationChart({ filter }: Props) {
  const { t } = useTranslation('reconciliationReport')

  const params = handleFilter(filter)

  const {
    data,
    isLoading: loading,
    isFetching,
  } = useQuery({
    queryKey: ['reconciliation-activity-chart', filter],
    queryFn: () => getReconciliationSummary(params),
    enabled: !!params?.year,
    select: (res) => {
      return res?.data?.map((item) => ({
        ...item,
        label: dayjs(item?.label).format('MMM YYYY'),
      }))
    },
  })

  const isLoading = loading || isFetching

  return (
    <div className="ui-relative">
      {!isLoading && (
        <div className="ui-absolute ui-right-0 ui-flex ui-justify-end">
          <DropdownMenuRoot>
            <DropdownMenuTrigger>
              <ButtonIcon size="lg" variant="default">
                <Download className="ui-size-5" />
              </ButtonIcon>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {DOWNLOAD_EXTENSIONS?.map((item) => (
                <DropdownMenuItem
                  key={item}
                  onClick={() =>
                    exportElement(
                      'reconciliation-activity-report',
                      item,
                      'Reconciliation Activity Report'
                    )
                  }
                >
                  {t('export_as', { type: item.toUpperCase() })}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenuRoot>
        </div>
      )}
      <div
        id="reconciliation-activity-report"
        className={cx('ui-h-[500px]', {
          'ui-grid ui-place-items-center ui-text-primary-500 ui-max-h-64':
            isLoading,
        })}
      >
        {isLoading && <GlobalSpinner />}
        {!isLoading && (
          <BarChart
            title={t('title.chart')}
            titleY={t('title.yLabel')}
            titleX={t('title.xLabel')}
            color="#0284C7"
            labelColor="#404040"
            data={data || []}
          />
        )}
      </div>
    </div>
  )
}
