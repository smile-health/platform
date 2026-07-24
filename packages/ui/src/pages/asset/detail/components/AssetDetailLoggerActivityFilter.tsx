import React, { useContext, useEffect, useState } from 'react'
import { parseDate } from '@internationalized/date'
import { Button } from '#components/button'
import { DateRangePicker } from '#components/date-picker'
import { FormControl, FormLabel } from '#components/form-control'
import Export from '#components/icons/Export'
import { OptionType, ReactSelect } from '#components/react-select'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import AssetDetailLoggerActivityContext from '../libs/asset-detail-logger-activity.context'
import { TFilterLoggerActivity } from '../libs/asset-detail.types'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

type AssetDetailLoggerActivityFilterProps = {
  loggerOptions: OptionType[]
}

const AssetDetailLoggerActivityFilter: React.FC<
  AssetDetailLoggerActivityFilterProps
> = ({ loggerOptions }) => {
  const { t } = useTranslation(['common', 'asset'])
  const { setFilter, filter, setShouldFetch } = useContext(
    AssetDetailLoggerActivityContext
  )

  const [localFilter, setLocalFilter] = useState(filter)

  useEffect(() => {
    setLocalFilter(filter)
  }, [filter])

  return (
    <div className="ui-flex ui-justify-start ui-items-center ui-gap-4">
      <FormControl className="ui-w-1/4">
        <FormLabel htmlFor="logger_options">
          {t('asset:detail.logger')}
        </FormLabel>
        <ReactSelect
          id="logger_options"
          options={loggerOptions}
          placeholder={t('common:all')}
          value={localFilter?.asset}
          onChange={(value: OptionType) => {
            const newFilter = {
              ...localFilter,
              asset: value,
            }
            setLocalFilter(newFilter as TFilterLoggerActivity)
          }}
        />
      </FormControl>
      <FormControl className="ui-w-full ui-flex-1">
        <FormLabel htmlFor="logger_input_date_picker">
          {t('common:form.date_range.label')}
        </FormLabel>
        <DateRangePicker
          id="logger_input_date_picker"
          data-testid="logger_input_date_picker"
          multiCalendar
          withPreset
          value={
            localFilter?.date_range?.start && localFilter?.date_range.end
              ? {
                  start: parseDate(localFilter.date_range.start.split('T')[0]),
                  end: parseDate(localFilter.date_range.end.split('T')[0]),
                }
              : null
          }
          onChange={(date) => {
            const newFilter = {
              ...localFilter,
              date_range: {
                start: dayjs(date?.start?.toString())?.isValid()
                  ? date?.start?.toString()
                  : '',
                end: dayjs(date?.end?.toString())?.isValid()
                  ? date?.end?.toString()
                  : '',
              },
            }
            setLocalFilter(newFilter as TFilterLoggerActivity)
          }}
          hideTimeZone
        />
      </FormControl>
      <div className="ui-flex ui-gap-2 ui-shrink ui-pt-4 ui-justify-end">
        <Button
          id="btn-export"
          variant="subtle"
          type="button"
          onClick={() => {}}
          leftIcon={<Export className="ui-size-5" />}
        >
          {t('common:export')}
        </Button>
        <span className="ui-h-full ui-w-px ui-bg-neutral-300" />

        <Button
          id="search__logger"
          variant="outline"
          className="ui-w-56"
          type="button"
          onClick={() => {
            setFilter(localFilter)
            setTimeout(() => {
              setShouldFetch(true)
            }, 50)
          }}
        >
          {t('common:search')}
        </Button>
      </div>
    </div>
  )
}

export default AssetDetailLoggerActivityFilter
