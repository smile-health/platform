import React from 'react'
import { parseDate } from '@internationalized/date'
import { DateRangePicker } from '#components/date-picker'
import { EmptyState } from '#components/empty-state'
import { Exists } from '#components/exists'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { TitleBlock } from '#pages/reconciliation/ReconciliationList/reconciliation-list.helpers'
import { numberFormatter } from '#utils/formatter'
import dayjs from 'dayjs'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useReconciliationTable } from '../hooks/useReconciliationTable'
import { useModalWarningItemStore } from '../store/modal-warning.store'
import ReconciliationReasonAndActionForm from './ReconciliationReasonAndActionForm'

const ReconciliationTableForm = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'reconciliation'])
  const { watch, isLoading, control, columns, setValue, errors, clearErrors } =
    useReconciliationTable()
  const { material, opname_stock_items } = watch()
  useSetLoadingPopupStore(isLoading)
  const { setModalRemove, setCustomFunction } = useModalWarningItemStore()
  return (
    <div className="ui-mt-5 ui-w-full ui-p-6 ui-pb-4 ui-border ui-border-gray-300 ui-rounded">
      <div className="ui-font-bold ui-text-dark-blue ui-mb-5">
        {t('reconciliation:create.table.title')}
      </div>
      <Exists useIt={!!material?.id}>
        <div className="ui-flex ui-flex-col ui-space-y-5 ui-w-1/2 ui-mb-5">
          <TitleBlock
            arrText={[
              {
                label: t('reconciliation:create.table.material_selected'),
                className: 'ui-text-neutral-500 ui-text-sm',
              },
              {
                label: material?.name ?? '-',
                className: 'ui-font-bold ui-text-dark-blue',
              },
            ]}
          />
          <Controller
            control={control}
            name="period_date"
            render={({
              field: { value, onChange, ...field },
              fieldState: { error },
            }) => (
              <FormControl>
                <FormLabel htmlFor="select-reconciliation-period" required>
                  {t('reconciliation:filter.period.label')}
                </FormLabel>
                <DateRangePicker
                  {...field}
                  value={value}
                  onChange={(value) => {
                    if (opname_stock_items?.length > 0) {
                      setModalRemove(true)
                      setCustomFunction(() => onChange(value))
                    } else onChange(value)
                  }}
                  id="reconciliation-period-date"
                  data-testid="reconciliation-period-date"
                  maxValue={parseDate(
                    dayjs(new Date()).add(1, 'day').format('YYYY-MM-DD')
                  )}
                />
                {error?.message && (
                  <FormErrorMessage>{error?.message}</FormErrorMessage>
                )}
              </FormControl>
            )}
          />
        </div>
      </Exists>
      <Table
        withBorder
        rounded
        hightlightOnHover
        overflowXAuto
        stickyOffset={0}
        loading={isLoading}
        empty={!opname_stock_items || opname_stock_items?.length === 0}
      >
        <Thead className="ui-bg-slate-100 ui-text-sm">
          <Tr>
            {columns.map((item) => (
              <Th
                key={`header-${item.id}`}
                id={`header-${item.id}`}
                columnKey={item.id}
                className="ui-text-sm ui-text-dark-blue ui-font-bold"
                style={{
                  ...(item.size && { width: item.size }),
                }}
              >
                {item.header}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody className="ui-bg-white ui-text-sm">
          {opname_stock_items?.map((item, index) => (
            <Tr
              className="ui-text-sm ui-font-normal"
              key={`item-reconciliation-${index.toString()}`}
            >
              <Td id={`cell-${columns[0].id}`}>{index + 1}</Td>
              <Td id={`cell-${columns[1].id}`}>
                {item.reconciliation_category_label}
              </Td>
              <Td id={`cell-${columns[2].id}`}>
                {numberFormatter(item.recorded_qty, language)}
              </Td>
              <Td id={`cell-${columns[3].id}`}>
                <Controller
                  key={`input-actual-qty-${index.toString()}`}
                  control={control}
                  name={`opname_stock_items.${index}.actual_qty`}
                  render={({
                    field: { value, onChange, ...field },
                    fieldState: { error },
                  }) => (
                    <FormControl>
                      <InputNumberV2
                        {...field}
                        id={`input-actual-qty-${index.toString()}`}
                        placeholder={t(
                          'reconciliation:create.real_placeholder'
                        )}
                        value={value ?? ''}
                        error={!!error?.message}
                        onValueChange={(values: any) => {
                          const { floatValue } = values
                          onChange(floatValue ?? null)
                          if (
                            Number(floatValue) === Number(item?.recorded_qty)
                          ) {
                            // remove value actions and reactions when actual qty same with recorded qty
                            setValue(
                              `opname_stock_items.${index}.actions`,
                              null
                            )
                            setValue(
                              `opname_stock_items.${index}.reasons`,
                              null
                            )
                            clearErrors([
                              `opname_stock_items.${index}.actions`,
                              `opname_stock_items.${index}.reasons`,
                            ])
                          }
                        }}
                      />
                      {error?.message && (
                        <FormErrorMessage>{error?.message}</FormErrorMessage>
                      )}
                    </FormControl>
                  )}
                />
              </Td>
              <Td id={`cell-${columns[4].id}`}>
                <ReconciliationReasonAndActionForm
                  indexItem={index}
                  setValueItem={setValue}
                  item={item}
                  errorItem={errors}
                  clearErrorItem={clearErrors}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
        <TableEmpty>
          <EmptyState
            title={t('common:message.empty.title')}
            description={t('common:message.empty.description')}
            withIcon
          />
        </TableEmpty>
      </Table>
    </div>
  )
}

export default ReconciliationTableForm
