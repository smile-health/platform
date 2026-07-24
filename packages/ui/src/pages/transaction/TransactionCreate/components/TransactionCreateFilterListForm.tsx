import { Fragment, useContext, useState } from 'react'
import { parseDate } from '@internationalized/date'
import {
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from '@repo/ui/components/tooltip'
import { Button } from '#components/button'
import { DateRangePicker } from '#components/date-picker'
import { FilterResetButton } from '#components/filter'
import { FormControl, FormLabel } from '#components/form-control'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import useSmileRouter from '#hooks/useSmileRouter'
import cx from '#lib/cx'
import { loadMaterial, loadMaterialType } from '#services/material'
import { getProgramStorage } from '#utils/storage/program'
import dayjs from 'dayjs'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadReason } from '../../transaction.services'
import { TransactionCreateCancellationContext } from '../context/TransactionCreateCancellationProvider'
import { TRANSACTION_TYPE } from '../transaction-create.constant'
import { CreateTransctionForm } from '../transaction-create.type'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

const TransactionCreateFilterListForm: React.FC = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['transactionCreate', 'transactionList', 'common'])
  const program = getProgramStorage()
  const { watch } = useFormContext<CreateTransctionForm>()
  const { activity, entity } = watch()
  const router = useSmileRouter()
  const { type: transactionType } = router.query
  const { filter, handleReset, handleSearch } = useContext(
    TransactionCreateCancellationContext
  )
  const [localFilter, setLocalFilter] = useState(filter)

  const truncateText = (text: string) => {
    const maxLength = 50
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
  }

  let disabled
  switch (Number(transactionType)) {
    case TRANSACTION_TYPE.CANCELLATION_OF_DISCARD:
      disabled = !!activity?.value && !!entity?.value
      break
    case TRANSACTION_TYPE.RETURN_FROM_HEALTH_FACILITIES:
      disabled =
        !!activity?.value &&
        !!entity?.value &&
        !!watch('customer') &&
        !!watch('actual_date')
      break
    default:
      disabled = false
  }

  const formatDate = (date: string) => {
    return dayjs(date).locale(language).format('DD MMM YYYY')
  }

  const filterMap = [
    {
      label: t('transactionList:filter.material_type.label'),
      value: filter?.material_type?.label ?? t('common:all'),
      existsIn: [
        TRANSACTION_TYPE.CANCELLATION_OF_DISCARD,
        TRANSACTION_TYPE.RETURN_FROM_HEALTH_FACILITIES,
      ],
    },
    {
      label: t('transactionList:filter.material.label'),
      value: filter?.material?.label ?? t('common:all'),
      existsIn: [
        TRANSACTION_TYPE.CANCELLATION_OF_DISCARD,
        TRANSACTION_TYPE.RETURN_FROM_HEALTH_FACILITIES,
      ],
    },
    {
      label: t('common:form.date_range.label'),
      value: `${formatDate(filter?.date_range?.start as string)?.toUpperCase()} - ${formatDate(
        filter?.date_range?.end as string
      )?.toUpperCase()}`,
      existsIn: [
        TRANSACTION_TYPE.CANCELLATION_OF_DISCARD,
        TRANSACTION_TYPE.RETURN_FROM_HEALTH_FACILITIES,
      ],
    },
    {
      label: t('transactionList:filter.reason.label'),
      value: filter?.transaction_reason?.label ?? t('common:all'),
      existsIn: [TRANSACTION_TYPE.CANCELLATION_OF_DISCARD],
    },
  ]

  return (
    <div className="ui-w-full ui-border ui-border-gray-300 ui-rounded">
      <div className={cx('ui-border ui-rounded ui-p-6 space-y-4')}>
        <div className="space-y-4">
          <div className={cx('ui-text-dark-blue ui-font-bold')}>Filter</div>
          <div className={cx('ui-text-gray-500')}>
            {Number(transactionType) ===
            TRANSACTION_TYPE.CANCELLATION_OF_DISCARD
              ? t('transactionCreate:cancel_transaction_discard.description')
              : t(
                  'transactionCreate:transaction_return_from_facility.description_select_transaction'
                )}
          </div>
          <div className="ui-flex ui-flex-col ui-gap-4">
            <FormControl>
              <FormLabel htmlFor="select-material-type">
                {t('transactionList:filter.material_type.label')}
              </FormLabel>
              <ReactSelectAsync
                id="select-material-type"
                data-testid="select-material-type"
                loadOptions={loadMaterialType}
                debounceTimeout={300}
                isClearable={true}
                placeholder={t('common:all')}
                additional={{
                  page: 1,
                }}
                onChange={(option: OptionType) =>
                  setLocalFilter((prev) => ({
                    ...prev,
                    material_type: option,
                    material: null,
                  }))
                }
                menuPosition="fixed"
                value={localFilter.material_type}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="select-material-name">
                {t('transactionList:filter.material.label')}
              </FormLabel>
              <ReactSelectAsync
                key={`${localFilter.material?.value}__${localFilter.material_type?.value}`}
                id="select-material-name"
                data-testid="select-material-name"
                loadOptions={loadMaterial as any}
                debounceTimeout={300}
                isClearable={true}
                placeholder={t('common:all')}
                additional={{
                  page: 1,
                  program_id: program.id,
                  is_with_activities: true,
                  material_type_ids: localFilter.material_type?.value,
                  material_activities: activity?.value ?? null,
                  lang: language,
                }}
                onChange={(option: OptionType) =>
                  setLocalFilter((prev) => ({
                    ...prev,
                    material: option,
                  }))
                }
                menuPosition="fixed"
                value={localFilter.material}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="input-date-range">
                {t('common:form.date_range.label')}
              </FormLabel>
              <DateRangePicker
                id="input-date-picker"
                data-testid="input-date-picker"
                multiCalendar
                withPreset
                value={
                  localFilter.date_range?.start && localFilter.date_range.end
                    ? {
                        start: parseDate(
                          localFilter.date_range.start.split('T')[0]
                        ),
                        end: parseDate(
                          localFilter.date_range.end.split('T')[0]
                        ),
                      }
                    : null
                }
                onChange={(date) =>
                  setLocalFilter((prev) => ({
                    ...prev,
                    date_range: {
                      start: dayjs(date?.start?.toString())?.isValid()
                        ? date?.start?.toString()
                        : '',
                      end: dayjs(date?.end?.toString())?.isValid()
                        ? date?.end?.toString()
                        : '',
                    },
                  }))
                }
                hideTimeZone
              />
            </FormControl>

            {TRANSACTION_TYPE.CANCELLATION_OF_DISCARD ===
              Number(transactionType) && (
              <FormControl>
                <FormLabel htmlFor="select-reason">
                  {t('transactionList:filter.reason.label')}
                </FormLabel>
                <ReactSelectAsync
                  id="select-reason"
                  data-testid="select-reason"
                  loadOptions={loadReason as any}
                  debounceTimeout={300}
                  isClearable={!!localFilter.transaction_reason?.value}
                  placeholder={t('common:all')}
                  additional={{
                    page: 1,
                    transaction_type_id: TRANSACTION_TYPE.DISCARD,
                    lang: language,
                  }}
                  onChange={(option: OptionType) =>
                    setLocalFilter((prev) => ({
                      ...prev,
                      transaction_reason: option,
                    }))
                  }
                  menuPosition="fixed"
                  value={localFilter.transaction_reason}
                />
              </FormControl>
            )}
          </div>
          <div className="ui-flex ui-justify-end ui-gap-2">
            <FilterResetButton
              variant="subtle"
              id="button__reset"
              onClick={() => {
                setLocalFilter((prev) => ({
                  ...prev,
                  material: null,
                  material_type: null,
                  transaction_reason: null,
                  date_range: {
                    start: dayjs().subtract(7, 'day').toISOString(),
                    end: dayjs().toISOString(),
                  },
                  page: 1,
                  paginate: 10,
                  transaction_type_id: TRANSACTION_TYPE.DISCARD,
                }))
                handleReset()
              }}
              disabled={!disabled}
            />
            <Button
              className="ui-w-48"
              type="button"
              onClick={() => handleSearch(localFilter)}
              disabled={!disabled}
            >
              {t('common:search')}
            </Button>
          </div>
          <hr />
          <div className="ui-flex ui-flex-col ui-gap-2">
            <div className="ui-text-gray-500 ui-font-semibold ui-text-sm">
              {t('common:active_filter')}
            </div>
            <div className="ui-leading-normal">
              {filterMap.map(
                (item, index) =>
                  item?.existsIn?.includes(Number(transactionType)) && (
                    <Fragment key={index?.toString()}>
                      <span className="ui-font-semibold mr-1">
                        {item?.label}:
                      </span>
                      {item?.value?.length > 20 ? (
                        <TooltipRoot delayDuration={0}>
                          <TooltipTrigger>
                            <span>{truncateText(item?.value)}</span>
                          </TooltipTrigger>
                          <TooltipContent>{item.value}</TooltipContent>
                        </TooltipRoot>
                      ) : (
                        <span>{item?.value}</span>
                      )}
                      {index < filterMap.length - 1 && (
                        <span className="ui-mx-2 last:ui-hidden">|</span>
                      )}
                    </Fragment>
                  )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionCreateFilterListForm
