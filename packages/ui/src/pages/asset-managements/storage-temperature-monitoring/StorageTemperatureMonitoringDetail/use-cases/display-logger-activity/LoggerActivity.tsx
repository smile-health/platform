import { useCallback, useEffect, useMemo } from 'react'
import { parseDate } from '@internationalized/date'
import { Button } from '#components/button'
import { DateRangePicker } from '#components/date-picker'
import { FormControl, FormLabel } from '#components/form-control'
import Export from '#components/icons/Export'
import { ReactSelect } from '#components/react-select'
import { TabsList, TabsRoot, TabsTrigger } from '#components/tabs'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import {
  LoggerActivityTab,
  tabList,
} from '../../storage-temperature-monitoring-detail.constants'
import { useStorageTemperatureMonitoringDetail } from '../../StorageTemperatureMonitoringDetailContext'
import { LoggerActivityCharts } from './LoggerActivityCharts'
import { LoggerActivityTable } from './LoggerActivityTable'

export const LoggerActivity = () => {
  const { t } = useTranslation(['storageTemperatureMonitoringDetail'])
  const {
    isWarehouse,
    data,
    isLoading,
    historyFilter,
    setHistoryFilter,
    refetchHistory,
    exportHistory,
    setActiveTab,
    activeTab,
  } = useStorageTemperatureMonitoringDetail()

  const loggerOptions = useMemo(() => {
    return data?.rtmd_devices?.map((item) => {
      const serialNumber = item?.serial_number
      const assetModelName = item?.asset_model?.name
        ? `- ${item?.asset_model?.name}`
        : ''
      const manufacturerName = item?.manufacture?.name
        ? `(${item?.manufacture?.name})`
        : ''
      return {
        value: item.id,
        label: `${serialNumber} ${assetModelName} ${manufacturerName}`,
      }
    })
  }, [data])

  const defaultDateRange = useMemo(() => {
    return {
      start: parseDate(dayjs().format('YYYY-MM-DD')),
      end: parseDate(dayjs().format('YYYY-MM-DD')),
    }
  }, [])

  const selectedLogger = useMemo(() => {
    const found =
      loggerOptions?.find((o) => o.value === historyFilter?.logger_id) ?? null
    return found ?? loggerOptions?.[0] ?? null
  }, [loggerOptions, historyFilter?.logger_id])

  useEffect(() => {
    if (!isLoading && !historyFilter?.logger_id && loggerOptions?.length) {
      setHistoryFilter({
        logger_id: loggerOptions[0].value as number,
        date_range: {
          from_date: parseDate(dayjs().format('YYYY-MM-DD')),
          to_date: parseDate(dayjs().format('YYYY-MM-DD')),
        },
      })
    }
  }, [isLoading, loggerOptions, historyFilter?.logger_id, setHistoryFilter])

  const HistoryFilter = useCallback(() => {
    const today = dayjs()
    const ninetyDaysAgo = today.subtract(90, 'day')
    const startOfMonthForNinetyDaysAgo = ninetyDaysAgo.startOf('month')

    return (
      <div className="ui-flex ui-flex-row ui-gap-4 ui-w-full">
        <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-full">
          <FormControl>
            <FormLabel>
              {t(
                'storageTemperatureMonitoringDetail:logger_activity.filters.logger.label'
              )}
            </FormLabel>
            <ReactSelect
              options={loggerOptions}
              isLoading={isLoading}
              value={selectedLogger}
              onChange={(value) =>
                setHistoryFilter({
                  ...historyFilter,
                  logger_id: (value as { value?: number })?.value,
                })
              }
            />
          </FormControl>
          <FormControl>
            <FormLabel>
              {t(
                'storageTemperatureMonitoringDetail:logger_activity.filters.date_range.label'
              )}
            </FormLabel>
            <DateRangePicker
              clearable
              defaultValue={defaultDateRange}
              value={{
                start: historyFilter?.date_range?.from_date,
                end: historyFilter?.date_range?.to_date,
              }}
              minValue={parseDate(
                startOfMonthForNinetyDaysAgo.format('YYYY-MM-DD')
              )}
              maxValue={parseDate(today.format('YYYY-MM-DD'))}
              isDateUnavailable={(date) =>
                date.compare(parseDate(ninetyDaysAgo.format('YYYY-MM-DD'))) < 0
              }
              onChange={(value) => {
                if (!value || (!value.start && !value.end)) {
                  setHistoryFilter({
                    ...historyFilter,
                    date_range: undefined,
                  })
                  return
                }

                const fromStr = value.start ? value.start.toString() : undefined
                const toStr = value.end ? value.end.toString() : undefined

                setHistoryFilter({
                  ...historyFilter,
                  date_range: {
                    from_date: fromStr ? parseDate(fromStr) : null,
                    to_date: toStr ? parseDate(toStr) : null,
                  },
                })
              }}
            />
          </FormControl>
        </div>
        <div className="ui-flex ui-flex-row ui-items-center ui-mt-5 ui-justify-end ui-space-x-2 ui-col-span-1 ui-right-0">
          <Button
            variant="subtle"
            className="ui-w-32"
            leftIcon={<Export className="ui-w-4 ui-h-4" />}
            loading={exportHistory.isLoading}
            disabled={exportHistory.isLoading}
            onClick={() => exportHistory.refetch()}
          >
            {t(
              'storageTemperatureMonitoringDetail:logger_activity.button.export'
            )}
          </Button>
          <Button
            variant="solid"
            disabled={isLoading}
            className="ui-w-32"
            onClick={() => refetchHistory()}
          >
            {t(
              'storageTemperatureMonitoringDetail:logger_activity.button.search'
            )}
          </Button>
        </div>
      </div>
    )
  }, [
    isLoading,
    loggerOptions,
    selectedLogger,
    historyFilter,
    setHistoryFilter,
    t,
    defaultDateRange,
    exportHistory,
    refetchHistory,
  ])

  const handleTabChange = useCallback(
    (tab: LoggerActivityTab) => {
      setActiveTab(tab)
    },
    [setActiveTab]
  )

  const tabs = useMemo(() => tabList(t), [t])

  return (
    <div className="ui-gap-4 ui-mx-auto ui-mb-4 ui-space-y-4">
      <div className=" ui-font-semibold ui-text-gray-900">
        {t('storageTemperatureMonitoringDetail:logger_activity.title')}
      </div>
      <HistoryFilter />
      {isWarehouse && (
        <TabsRoot variant="default" value={activeTab}>
          <div className="ui-flex ui-items-center ui-gap-4 mb-5">
            <TabsList className="ui-grid-cols-4 ui-grow">
              {tabs?.map((item) => (
                <TabsTrigger
                  key={item?.value}
                  value={item?.value}
                  className="ui-justify-center ui-text-sm ui-px-2 ui-h-10 ui-outline-none focus:ui-outline-none focus-visible:ui-outline-none focus:ui-ring-0 focus-visible:ui-ring-0"
                  onClick={() => handleTabChange(item?.value)}
                >
                  {item?.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </TabsRoot>
      )}
      <LoggerActivityCharts selectedLogger={selectedLogger} />
      <LoggerActivityTable />
    </div>
  )
}
