import { EmptyState } from '#components/empty-state'
import { FormControl, FormErrorMessage } from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { ReactSelectAsync } from '#components/react-select'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { numberFormatter } from '#utils/formatter'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadStockQualities } from '../../order.service'
import { tableBatchHeader } from '../order-create-distribution.constant'
import { mergeBatch, parseDate } from '../order-create-distribution.helper'
import {
  TFormatBatch,
  TOrderFormItemsValues,
} from '../order-create-distribution.type'

type FormValues = Pick<TOrderFormItemsValues, 'material'> & {
  validBatch: TFormatBatch[]
  expiredBatch: TFormatBatch[]
}

type OrderCreateDistributionTableBatchBodyProps = Readonly<{
  data: TFormatBatch[]
  isValid?: boolean
}>

function OrderCreateDistributionTableBatchBody({
  data,
  isValid,
}: OrderCreateDistributionTableBatchBodyProps) {
  const {
    t,
    i18n: { language },
  } = useTranslation('orderDistribution')

  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<FormValues>()

  function formatNumber(value?: number) {
    return numberFormatter(value ?? 0, language)
  }

  const material = watch('material')
  const isDisabledMaterialStatus = !material?.is_temperature_sensitive
  const isManagedInBatch = Boolean(material?.is_managed_in_batch)
  const isShowLabel = !isValid || (isValid && isManagedInBatch)

  return (
    <>
      {isShowLabel && (
        <Tr>
          <Td
            colSpan={6}
            className="ui-font-semibold ui-text-xs ui-bg-[#E2E8F0]"
          >
            {isValid && isManagedInBatch && t('label.material_batch.valid')}
            {!isValid && t('label.material_batch.expired')}
          </Td>
        </Tr>
      )}

      {data?.map((item, index) => {
        const key = isValid ? 'validBatch' : 'expiredBatch'
        const ordered_qty = watch(`${key}.${index}.ordered_qty`) ?? ''
        const ordered_qty_err =
          errors?.[key as 'validBatch' | 'expiredBatch']?.[index]?.ordered_qty

        return (
          <Tr key={item?.id}>
            <Td>{index + 1}</Td>
            {isManagedInBatch ? (
              <Td>
                <p>
                  <strong>{item?.code || '-'}</strong>
                </p>
                <p>
                  {t('label.date.production')}:{' '}
                  {parseDate(item?.production_date)}
                </p>
                <p>
                  {t('label.manufacturer')}: {item?.manufacturer?.name || '-'}
                </p>
                <p>
                  {t('label.date.expired')}:{' '}
                  <span className={isValid ? undefined : 'ui-text-red-600'}>
                    {parseDate(item?.expired_date)}
                  </span>
                </p>
              </Td>
            ) : (
              <Td>-</Td>
            )}
            <Td>
              <p>
                {t('label.stock.on_hand')}: {formatNumber(item?.qty)}
              </p>
              <p>
                {t('label.stock.available')}:{' '}
                {formatNumber(item?.available_qty)}
              </p>
              <p>
                {t('label.allocated')}: {formatNumber(item?.allocated_qty)}
              </p>
            </Td>
            <Td>{item?.activity?.name}</Td>
            <Td className="ui-min-w-64">
              <FormControl className="ui-space-y-1">
                <InputNumberV2
                  data-testid={`input-quantity-${key}-${index}`}
                  placeholder={t('form.ordered_qty.placeholder')}
                  value={ordered_qty}
                  error={Boolean(ordered_qty_err)}
                  onValueChange={(values) => {
                    const newValue = values?.floatValue
                    setValue(`${key}.${index}.ordered_qty`, newValue, {
                      shouldValidate: true,
                    })
                  }}
                />
                {ordered_qty_err && (
                  <FormErrorMessage>
                    {ordered_qty_err?.message}
                  </FormErrorMessage>
                )}
              </FormControl>
            </Td>
            <Td className="ui-w-52">
              <Controller
                control={control}
                name={`${key}.${index}.order_stock_status`}
                render={({
                  field: { ref, ...field },
                  fieldState: { error },
                }) => (
                  <FormControl className="ui-space-y-1">
                    <ReactSelectAsync
                      {...field}
                      data-testid={`select-status-${key}-${index}`}
                      selectRef={ref}
                      disabled={isDisabledMaterialStatus}
                      placeholder={t('form.status.placeholder')}
                      menuPosition="fixed"
                      loadOptions={loadStockQualities}
                      isClearable
                      additional={{
                        page: 1,
                      }}
                    />
                    {error?.message && (
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                    )}
                  </FormControl>
                )}
              />
            </Td>
          </Tr>
        )
      })}
    </>
  )
}

export default function OrderCreateDistributionTableBatch() {
  const { t } = useTranslation('orderDistribution')

  const { watch } = useFormContext<FormValues>()

  const headers = tableBatchHeader(t)

  const material = watch('material')
  const validBatch = watch('validBatch')
  const expiredBatch = watch('expiredBatch')
  const isManagedInBatch = Boolean(material?.is_managed_in_batch)
  const batch = mergeBatch(isManagedInBatch, validBatch, expiredBatch)

  return (
    <Table
      withBorder
      rounded
      hightlightOnHover
      overflowXAuto
      stickyOffset={0}
      empty={!batch?.length}
      verticalAlignment="top"
    >
      <Thead>
        <Tr>{headers?.map((header) => <Th key={header}>{header}</Th>)}</Tr>
      </Thead>
      <Tbody>
        {Boolean(validBatch?.length) && (
          <OrderCreateDistributionTableBatchBody isValid data={validBatch} />
        )}

        {Boolean(expiredBatch?.length) && (
          <OrderCreateDistributionTableBatchBody data={expiredBatch} />
        )}
      </Tbody>
      <TableEmpty className="ui-h-52">
        <EmptyState
          title={t('info.empty.title')}
          description={t('info.empty.description.stock')}
          withIcon
        />
      </TableEmpty>
    </Table>
  )
}
