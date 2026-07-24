import React, { Fragment, useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { parseDate } from '@internationalized/date'
import { Button } from '#components/button'
import { DatePicker } from '#components/date-picker'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import XMark from '#components/icons/XMark'
import { Input } from '#components/input'
import {
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalRoot,
} from '#components/modal'
import { ReactSelect } from '#components/react-select'
import { handleDateChange, parseValidDate } from '#utils/date'
import dayjs from 'dayjs'
import {
  Controller,
  FieldArrayWithId,
  FormProvider,
  useForm,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { formStockBatchSchema } from '../schemas/stockOpnameFormSchema'
import { loadManufacturer } from '../services'
import {
  NewOpnameStocks,
  PopulatedBatchAndActivity,
  StockOpnameCreateItemStockBatchForm,
  StockOpnameCreateItemStocksForm,
} from '../types'

type Props = {
  open: boolean
  handleClose: () => void
  data: {
    material_id: number
    activities: Array<{
      id: number
      name: string
    }>
    is_batch: boolean
  }
  handleSubmitBatch: (values: StockOpnameCreateItemStockBatchForm) => void
  new_opname_stock: FieldArrayWithId<
    StockOpnameCreateItemStocksForm,
    'new_opname_stocks',
    'id'
  >[]
}

const StockOpnameModalAddBatch: React.FC<Props> = (props) => {
  const { open, handleClose, data, handleSubmitBatch, new_opname_stock } = props
  const { t } = useTranslation(['common', 'stockOpnameCreate'])

  const PopulatedBatchAndActivity: PopulatedBatchAndActivity[] = useMemo(() => {
    return new_opname_stock.map((item: NewOpnameStocks) => ({
      activity_id: item.activity.id,
      batch_code: item?.batch?.code,
    }))
  }, [new_opname_stock])
  const methods = useForm<StockOpnameCreateItemStockBatchForm>({
    resolver: yupResolver(formStockBatchSchema(t)),
    mode: 'onChange',
    defaultValues: {
      batch_code: '',
      activity: null,
      expired_date: undefined,
      is_batch: data.is_batch,
      populated_batch: PopulatedBatchAndActivity,
    },
  })
  const { control, handleSubmit, trigger } = methods

  const onSubmit = (values: StockOpnameCreateItemStockBatchForm) => {
    handleSubmitBatch(values)
  }

  const modalRoot = document.getElementById('drawer-batch') || document.body

  return (
    <FormProvider {...methods}>
      <ModalRoot
        open={open}
        className="ui-z-10"
        classNameOverlay="ui-z-10"
        verticalCentered
        closeOnOverlayClick={false}
        portalContainer={modalRoot}
      >
        <ModalCloseButton onClick={handleClose} />
        <ModalHeader border className="ui-text-center ui-pr-0">
          <span className="ui-font-medium">
            {
              t('stockOpnameCreate:form.new_batch.title', {
                returnObjects: true,
              })[data.is_batch ? 0 : 1]
            }
          </span>
        </ModalHeader>
        <ModalContent>
          <div className="ui-flex ui-flex-col ui-space-y-5">
            {data.is_batch && (
              <Fragment>
                <Controller
                  control={control}
                  name="batch_code"
                  render={({
                    field: { value, onChange, ...field },
                    fieldState: { error },
                  }) => (
                    <FormControl>
                      <FormLabel required>
                        {t('stockOpnameCreate:form.new_batch.label.batch_code')}
                      </FormLabel>
                      <Input
                        {...field}
                        id="input-new-batch-code"
                        placeholder={t(
                          'stockOpnameCreate:form.new_batch.placeholder.batch_code'
                        )}
                        value={value || ''}
                        type="text"
                        min={0}
                        error={!!error?.message}
                        onChange={(e) => {
                          onChange(e.target.value.toUpperCase())
                        }}
                      />
                      {error?.message && (
                        <FormErrorMessage>{error?.message}</FormErrorMessage>
                      )}
                    </FormControl>
                  )}
                />
                <Controller
                  control={control}
                  name="expired_date"
                  render={({
                    field: { value, onChange, ...field },
                    fieldState: { error },
                  }) => (
                    <FormControl>
                      <FormLabel required>
                        {t(
                          'stockOpnameCreate:form.new_batch.label.expired_date'
                        )}
                      </FormLabel>
                      <DatePicker
                        {...field}
                        data-testid="input-new-batch-expired-date"
                        id="input-new-batch-expired-date"
                        value={parseValidDate(value)}
                        minValue={parseDate(
                          dayjs(new Date()).format('YYYY-MM-DD')
                        )}
                        onChange={handleDateChange(onChange)}
                        error={!!error?.message}
                      />
                      {error?.message && (
                        <FormErrorMessage>{error?.message}</FormErrorMessage>
                      )}
                    </FormControl>
                  )}
                />
              </Fragment>
            )}
            <Controller
              control={control}
              name="activity"
              render={({
                field: { value, onChange, ...field },
                fieldState: { error },
              }) => (
                <FormControl>
                  <FormLabel required>
                    {t('stockOpnameCreate:form.new_batch.label.activity')}
                  </FormLabel>
                  <ReactSelect
                    {...field}
                    value={value}
                    id="input-new-batch-activity"
                    data-testid="input-new-batch-activity"
                    options={data.activities.map((activity) => ({
                      value: activity.id,
                      label: activity.name,
                    }))}
                    isClearable
                    placeholder={t(
                      'stockOpnameCreate:form.new_batch.placeholder.activity'
                    )}
                    onChange={(option) => {
                      onChange(option)
                      trigger('batch_code')
                    }}
                    menuPosition="fixed"
                    error={!!error?.message}
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </FormControl>
              )}
            />
          </div>
        </ModalContent>
        <ModalFooter className="ui-border ui-flex ui-flex-row">
          <Button
            color="danger"
            variant="default"
            className="w-full"
            onClick={handleClose}
            type="button"
          >
            {t('common:cancel')}
          </Button>

          <Button
            variant="solid"
            className="w-full"
            type="button"
            onClick={() => handleSubmit(onSubmit)()}
          >
            {t('common:save')}
          </Button>
        </ModalFooter>
      </ModalRoot>
    </FormProvider>
  )
}

export default StockOpnameModalAddBatch
