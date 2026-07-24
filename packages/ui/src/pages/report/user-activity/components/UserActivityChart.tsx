import { forwardRef, useImperativeHandle } from 'react'
import { ButtonIcon } from '#components/button-icon'
import { PieChart } from '#components/chart'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '#components/dropdown-menu'
import Download from '#components/icons/Download'
import { GlobalSpinner } from '#components/spinner'
import cx from '#lib/cx'
import { exportElement } from '#utils/download'
import { Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import useGetOverviewChart from '../hooks/useGetOverviewChart'
import { DOWNLOAD_EXTENSIONS } from '../user-activity.constant'

type Props = Readonly<{
  filter: Values<Record<string, any>>
}>

const UserActivityChart = forwardRef(function UserActivityChart(
  { filter }: Props,
  ref: React.Ref<{ getChart: VoidFunction }>
) {
  const { t } = useTranslation('userActivity')

  const {
    month,
    activity,
    data,
    total,
    legendMaps,
    isEmpty,
    isLoading,
    getChart,
  } = useGetOverviewChart(filter)

  const provinceLabel = filter?.province?.label
  const regencyLabel = filter?.regency?.label
  const entityLabel = filter?.entity?.label

  useImperativeHandle(ref, () => ({
    getChart,
  }))

  return (
    <div className="ui-relative ui-p-4 ui-space-y-4 ui-border ui-border-neutral-300 ui-rounded">
      {!isLoading && (
        <div className="ui-flex ui-justify-end">
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
                      'user-activity-overview',
                      item,
                      'User Activity Overview'
                    )
                  }
                >
                  {t('export', { type: item.toUpperCase() })}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenuRoot>
        </div>
      )}
      <div className="ui-space-y-10">
        {!isLoading && (
          <div className="ui-flex ui-justify-center">
            <div className="ui-border ui-border-neutral-400 ui-p-2">
              <p className="ui-space-x-1 ui-text-gray-500">
                <strong>
                  {entityLabel ?? regencyLabel ?? provinceLabel ?? 'Indonesia'}
                </strong>
                <span>({total})</span>
              </p>
              {data?.map((item) => (
                <p key={item?.name} className="ui-space-x-1 ui-text-gray-500">
                  <strong>{item?.name}</strong>
                  <span>({item?.value})</span>
                </p>
              ))}
            </div>
          </div>
        )}
        <div
          id="user-activity-overview"
          className={cx('ui-h-[450px]', {
            'ui-grid ui-place-items-center': isLoading || isEmpty,
            'ui-text-primary-500 ui-max-h-64': isLoading,
            'ui-max-h-96': isEmpty,
          })}
        >
          {isLoading && <GlobalSpinner />}
          {isEmpty && (
            <p className="ui-text-gray-500 ui-text-sm">{t('empty')}</p>
          )}
          {!isLoading && !isEmpty && (
            <PieChart
              data={data}
              color={['#22C55E', '#EF4444']}
              title={`${month} ${activity?.name}`}
              tooltipFormatter={t('percentage', { total })}
              legendOptions={{
                formatter: (name) => legendMaps?.[name],
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
})

export default UserActivityChart
