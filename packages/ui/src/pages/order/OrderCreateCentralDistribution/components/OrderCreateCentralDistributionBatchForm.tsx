import { useRef } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { DateValue, parseDate } from '@internationalized/date'
import { Button } from '#components/button'
import { DatePicker } from '#components/date-picker'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import {
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalRoot,
} from '#components/modal'
import {
  OptionType,
  ReactSelect,
  ReactSelectAsync,
} from '#components/react-select'
import { loadPlatformManufacturers } from '#services/manufacturer'
import { isValidDate, parseDateTime } from '#utils/date'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { handleExternalSubmit } from '../../order.helper'
import { years } from '../order-create-central-distribution.constant'
import { loadBudgetSource } from '../order-create-central-distribution.service'
import {
  PopulatedBatchAndManufacturer,
  TOrderFormItemStocksValues,
} from '../order-create-central-distribution.type'
import orderCreateCentralDistributionBatchSchema from '../schemas/orderCreateCentralDistributionBatchSchema'

type FormValues = Pick<
  TOrderFormItemStocksValues,
  | 'batch_code'
  | 'budget_source'
  | 'budget_year'
  | 'expired_date'
  | 'manufacturer'
  | 'production_date'
> & { populated_batch?: PopulatedBatchAndManufacturer[] }

type Props = {
  index: number | null
  open: boolean
  data: TOrderFormItemStocksValues | null
  setOpen: (value: boolean) => void
  onSubmit: (data: TOrderFormItemStocksValues, index?: number | null) => void
  materialId: number
  isManagedInBatch?: number
  PopulatedBatchAndManufacturer: PopulatedBatchAndManufacturer[]
}

export default function OrderCreateCentralDistributionBatchForm({
  open,
  data,
  index,
  setOpen,
  onSubmit,
  materialId,
  isManagedInBatch,
  PopulatedBatchAndManufacturer,
}: Readonly<Props>) {
  const isEdit = Boolean(data) && index !== null
  const formRef = useRef<HTMLFormElement | null>(null)
  const { t } = useTranslation('orderCentralDistribution')

  const modalRoot = document.getElementById('drawer-batch') || document.body

  const {
    control,
    handleSubmit,
    formState: { isValid },
    trigger,
  } = useForm<FormValues>({
    resolver: yupResolver(orderCreateCentralDistributionBatchSchema(t)),
    mode: 'onChange',
    context: {
      is_managed_in_batch: isManagedInBatch,
    },
    defaultValues: {
      batch_code: data?.batch_code ?? '',
      budget_source: data?.budget_source ?? null,
      budget_year: data?.budget_year ?? null,
      expired_date: data?.expired_date ?? null,
      manufacturer: data?.manufacturer ?? null,
      production_date: data?.production_date ?? null,
      populated_batch: PopulatedBatchAndManufacturer,
    },
  })

  const now = new Date()
  const today = parseDate(parseDateTime(now.toString(), 'YYYY-MM-DD'))

  const handleDateChange = (
    date: DateValue,
    onChange: (...event: any[]) => void
  ) => {
    const newDate = date as unknown as string
    onChange(parseDateTime(newDate, 'YYYY-MM-DD'))
  }

  const onValid: SubmitHandler<FormValues> = (form) => {
    const newData = {
      activity_id: null,
      ...data,
      ...form,
    }

    if (isEdit) onSubmit(newData, index)
    else onSubmit(newData)
  }

  return (
    <ModalRoot
      open={open}
      setOpen={setOpen}
      className="ui-z-10"
      classNameOverlay="ui-z-10"
      verticalCentered
      closeOnOverlayClick={false}
      portalContainer={modalRoot}
    >
      <ModalCloseButton />
      <ModalHeader className="ui-text-center">
        {isEdit ? t('section.batch.edit') : t('section.batch.add')}
      </ModalHeader>
      <ModalContent>
        <form
          ref={formRef}
          onSubmit={handleSubmit(onValid)}
          className="ui-space-y-6"
        >
          <Controller
            control={control}
            name="batch_code"
            render={({
              field: { value, onChange, ...field },
              fieldState: { error },
            }) => (
              <FormControl className="ui-space-y-1">
                <FormLabel htmlFor="input-batch-code" required>
                  {t('form.batch.id.label')}
                </FormLabel>
                <Input
                  {...field}
                  id="input-batch-code"
                  data-testid="input-batch-code"
                  placeholder={t('form.batch.id.placeholder')}
                  value={value || ''}
                  type="text"
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
            name="production_date"
            control={control}
            render={({
              field: { value, onChange, ...field },
              fieldState: { error },
            }) => (
              <FormControl className="ui-space-y-1">
                <FormLabel htmlFor="production-date">
                  {t('form.date.production.label')}
                </FormLabel>
                <DatePicker
                  {...field}
                  id="production-date"
                  data-testid="production-date"
                  maxValue={today}
                  value={value && isValidDate(value) ? parseDate(value) : null}
                  onChange={(date) => handleDateChange(date, onChange)}
                />
                {error && <FormErrorMessage>{error?.message}</FormErrorMessage>}
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="manufacturer"
            render={({
              field: { onChange, ...field },
              fieldState: { error },
            }) => (
              <FormControl className="ui-space-y-1">
                <FormLabel htmlFor="select-manufacturer" required>
                  {t('form.manufacturer.label')}
                </FormLabel>
                <ReactSelectAsync
                  {...field}
                  id="select-manufacturer"
                  data-testid="select-manufacturer"
                  loadOptions={loadPlatformManufacturers}
                  debounceTimeout={300}
                  disabled={!materialId}
                  isClearable
                  placeholder={t('form.manufacturer.placeholder')}
                  additional={{
                    page: 1,
                    status: 1,
                    material_id: materialId,
                  }}
                  error={Boolean(error?.message)}
                  onChange={(option) => {
                    onChange(option)
                    trigger('batch_code')
                  }}
                />
                {error?.message && (
                  <FormErrorMessage>{error?.message}</FormErrorMessage>
                )}
              </FormControl>
            )}
          />

          <Controller
            name="expired_date"
            control={control}
            render={({
              field: { value, onChange, ...field },
              fieldState: { error },
            }) => (
              <FormControl className="ui-space-y-1">
                <FormLabel htmlFor="expired-date" required>
                  {t('form.date.expired.label')}
                </FormLabel>
                <DatePicker
                  {...field}
                  id="expired-date"
                  data-testid="expired-date"
                  minValue={today}
                  value={value && isValidDate(value) ? parseDate(value) : null}
                  onChange={(date) => handleDateChange(date, onChange)}
                />
                {error && <FormErrorMessage>{error?.message}</FormErrorMessage>}
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="budget_year"
            render={({
              field: { value, onChange, ...field },
              fieldState: { error },
            }) => (
              <FormControl className="ui-space-y-1">
                <FormLabel htmlFor="select-batch-year" required>
                  {t('form.plan.year.label')}
                </FormLabel>
                <ReactSelect
                  {...field}
                  isClearable
                  id="select-batch-year"
                  data-testid="select-batch-year"
                  placeholder={t('form.plan.year.placeholder')}
                  options={years}
                  menuPosition="fixed"
                  value={value ? years?.find((y) => y?.value === value) : null}
                  onChange={(option: OptionType) => {
                    onChange(option?.value)
                  }}
                />
                {error && <FormErrorMessage>{error?.message}</FormErrorMessage>}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="budget_source"
            render={({ field: { ref, ...field }, fieldState: { error } }) => (
              <FormControl className="ui-space-y-1">
                <FormLabel htmlFor="select-source" required>
                  {t('form.plan.source.label')}
                </FormLabel>
                <ReactSelectAsync
                  {...field}
                  id="select-source"
                  data-testid="select-source"
                  placeholder={t('form.plan.source.placeholder')}
                  selectRef={ref}
                  loadOptions={loadBudgetSource}
                  menuPosition="fixed"
                  additional={{
                    page: 1,
                    status: 1,
                  }}
                  isClearable
                />
                {error && <FormErrorMessage>{error?.message}</FormErrorMessage>}
              </FormControl>
            )}
          />
        </form>
      </ModalContent>
      <ModalFooter className="ui-grid ui-grid-cols-2">
        <Button variant="outline" onClick={() => setOpen(!open)}>
          {t('action.cancel')}
        </Button>
        <Button
          disabled={!isValid}
          onClick={() => handleExternalSubmit(formRef)}
        >
          {t('action.save')}
        </Button>
      </ModalFooter>
    </ModalRoot>
  )
}
