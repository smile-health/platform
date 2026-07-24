import { Button } from '#components/button'
import { EmptyState } from '#components/empty-state'
import { FormControl, FormErrorMessage } from '#components/form-control'
import { Input } from '#components/input'
import { InputNumberV2 } from '#components/input-number-v2'
import {
  OptionType,
  ReactSelect,
  ReactSelectAsync,
} from '#components/react-select'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { numberFormatter } from '#utils/formatter'
import { Controller, FieldArrayWithId, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  tableBatchHeader,
  years,
} from '../order-create-central-distribution.constant'
import { parseDate } from '../order-create-central-distribution.helper'
import { loadBudgetSource } from '../order-create-central-distribution.service'
import { TOrderFormItemStocksValues } from '../order-create-central-distribution.type'

type FormValues = {
  stocks: TOrderFormItemStocksValues[]
}

type Props = {
  fields: FieldArrayWithId<FormValues, 'stocks', 'id'>[]
  unit?: string
  isManagedInBatch?: boolean
  onRemove: (index: number) => void
  onShowEdit: (data: TOrderFormItemStocksValues, index: number) => void
}

export default function OrderCreateCentralDistributionTableBatch({
  fields,
  onRemove,
  onShowEdit,
  unit,
  isManagedInBatch,
}: Readonly<Props>) {
  const {
    t,
    i18n: { language },
  } = useTranslation('orderCentralDistribution')

  const {
    control,
    setValue,
    formState: { errors },
    watch,
  } = useFormContext<FormValues>()

  const headers = tableBatchHeader(t, unit, isManagedInBatch)

  const getPrice = (index: number) => {
    const total = watch(`stocks.${index}.total_price`)
    const qty = watch(`stocks.${index}.ordered_qty`)

    const price = Number(total) / Number(qty)

    return price ? numberFormatter(price, language, 'currency') : ''
  }

  return (
    <Table
      withBorder
      rounded
      hightlightOnHover
      overflowXAuto
      stickyOffset={0}
      empty={!fields?.length}
      verticalAlignment="top"
    >
      <Thead>
        <Tr>
          {headers?.map((header, index) => (
            <Th key={header || index}>{header}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {fields?.map((field, index) => {
          const { ordered_qty, total_price } = field
          const errorField = errors?.stocks?.[index]

          return (
            <Tr key={field?.id}>
              <Td>{index + 1}</Td>
              {isManagedInBatch ? (
                <Td className="ui-space-y-0.5">
                  <p>
                    <strong>{field?.batch_code ?? '-'}</strong>
                  </p>
                  <p>
                    {t('label.date.production')}:{' '}
                    {parseDate(field?.production_date)}
                  </p>
                  <p>
                    {t('label.manufacturer')}:{' '}
                    {field?.manufacturer?.label ?? '-'}
                  </p>
                  <p>
                    {t('label.date.expired')}: {parseDate(field?.expired_date)}
                  </p>
                  <p>
                    {t('label.plan.year')}: {field?.budget_year}
                  </p>
                  <p>
                    {t('label.plan.source')}: {field?.budget_source?.label}
                  </p>
                </Td>
              ) : (
                <Td>-</Td>
              )}
              <Td>
                <FormControl className="ui-space-y-1">
                  <InputNumberV2
                    data-testid={`input-quantity-batch-${index}`}
                    placeholder={t('form.ordered_qty.placeholder')}
                    value={ordered_qty ?? ''}
                    error={Boolean(errorField?.ordered_qty)}
                    onValueChange={(values) => {
                      setValue(
                        `stocks.${index}.ordered_qty`,
                        values?.floatValue
                      )
                    }}
                  />
                  {errorField?.ordered_qty && (
                    <FormErrorMessage>
                      {errorField?.ordered_qty?.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              </Td>
              {!isManagedInBatch && (
                <>
                  <Td>
                    <Controller
                      control={control}
                      name={`stocks.${index}.budget_year`}
                      render={({
                        field: { value, onChange, ...field },
                        fieldState: { error },
                      }) => (
                        <FormControl className="ui-space-y-1">
                          <ReactSelect
                            {...field}
                            isClearable
                            id="select-year"
                            data-testid="select-year"
                            placeholder={t('form.plan.year.placeholder')}
                            options={years}
                            menuPosition="fixed"
                            value={
                              value
                                ? years?.find((y) => y?.value === value)
                                : null
                            }
                            onChange={(option: OptionType) => {
                              onChange(option?.value)
                            }}
                          />
                          {error && (
                            <FormErrorMessage>
                              {error?.message}
                            </FormErrorMessage>
                          )}
                        </FormControl>
                      )}
                    />
                  </Td>

                  <Td>
                    <Controller
                      control={control}
                      name={`stocks.${index}.budget_source`}
                      render={({
                        field: { ref, ...field },
                        fieldState: { error },
                      }) => (
                        <FormControl className="ui-space-y-1">
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
                          {error && (
                            <FormErrorMessage>
                              {error?.message}
                            </FormErrorMessage>
                          )}
                        </FormControl>
                      )}
                    />
                  </Td>
                </>
              )}
              <Td>
                <FormControl className="ui-space-y-1">
                  <InputNumberV2
                    data-testid={`input-total-batch-${index}`}
                    placeholder={t('form.price.total.placeholder')}
                    value={total_price ?? ''}
                    isPriceTag
                    error={Boolean(errorField?.total_price)}
                    onValueChange={(values) => {
                      setValue(
                        `stocks.${index}.total_price`,
                        values?.floatValue
                      )
                    }}
                  />
                  {errorField?.total_price && (
                    <FormErrorMessage>
                      {errorField?.total_price?.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              </Td>
              <Td>
                <Input
                  data-testid={`input-price-batch-${index}`}
                  placeholder={t('form.price.unit.placeholder', { unit })}
                  value={getPrice(index)}
                  disabled
                />
              </Td>
              {isManagedInBatch && (
                <Td className="ui-flex ui-gap-4">
                  <Button
                    onClick={() => onShowEdit(field, index)}
                    className="ui-p-1 ui-h-auto"
                    variant="subtle"
                  >
                    {t('action.edit')}
                  </Button>
                  <Button
                    onClick={() => onRemove(index)}
                    className="ui-p-1 ui-h-auto"
                    color="danger"
                    variant="subtle"
                  >
                    {t('action.remove')}
                  </Button>
                </Td>
              )}
            </Tr>
          )
        })}
      </Tbody>
      <TableEmpty className="ui-h-52">
        <EmptyState
          title={t('info.empty.title')}
          description={t('info.empty.description.batch')}
          withIcon
        />
      </TableEmpty>
    </Table>
  )
}
