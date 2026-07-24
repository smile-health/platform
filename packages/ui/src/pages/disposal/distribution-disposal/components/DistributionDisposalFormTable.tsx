import React, { Fragment, useState } from 'react'
import { Button } from '#components/button'
import { EmptyState } from '#components/empty-state'
import { FormErrorMessage } from '#components/form-control'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { numberFormatter } from '#utils/formatter'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  DistributionDisposalForm,
  DistributionDisposalOrderItemForm,
  DistributionDisposalStockForm,
} from '../types/DistributionDisposal'
import DistributionDisposalFormTableButtonBatch from './DistributionDisposalFormTableButtonBatch'
import DistributionDisposalFormTableDetail from './DistributionDisposalFormTableDetail'

const DistributionDisposalFormTable: React.FC = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'distributionDisposal'])
  const {
    watch,
    setValue,
    formState: { errors },
    clearErrors,
  } = useFormContext<DistributionDisposalForm>()
  const [selected, setSelected] = useState<{
    open: boolean
    index: number
    data: DistributionDisposalOrderItemForm | null
  }>({
    open: false,
    index: -1,
    data: null,
  })
  const { order_items } = watch()

  const handleRemove = (id: number, index: number) => {
    const newOrderItems = order_items.filter((x) => x.material_id !== id)
    setValue('order_items', newOrderItems)
    clearErrors('order_items')
  }

  const handleUpdateParent = (stocks: DistributionDisposalStockForm[]) => {
    const newOrderItems = [...order_items]
    newOrderItems[selected.index].stocks = stocks
    newOrderItems[selected.index].is_valid = true
    setValue('order_items', newOrderItems)
    clearErrors(`order_items.${selected.index}.is_valid`)
    setSelected({ open: false, index: -1, data: null })
  }

  return (
    <div className="ui-mt-6">
      {selected.open && (
        <DistributionDisposalFormTableDetail
          open={selected.open}
          data={selected.data}
          handleClose={() =>
            setSelected({ open: false, index: -1, data: null })
          }
          handleUpdateParent={handleUpdateParent}
        />
      )}

      <Table
        withBorder
        rounded
        hightlightOnHover
        overflowXAuto
        stickyOffset={0}
        empty={order_items.length === 0}
        verticalAlignment="center"
      >
        <Thead>
          <Tr>
            <Th
              id="header-no"
              columnKey="no"
              className="ui-w-20 ui-font-semibold"
            >
              Si. No.
            </Th>
            <Th
              id="header-material-info"
              columnKey="material-info"
              className="ui-font-semibold"
            >
              {t('distributionDisposal:table.column.material_info')}
            </Th>
            <Th
              id="header-stock-disposal"
              columnKey="stock-disposal"
              className="ui-font-semibold"
            >
              {t('distributionDisposal:table.column.total_discard')}
            </Th>
            <Th
              id="header-quantity"
              columnKey="quantity"
              className="ui-font-semibold"
            >
              {t('distributionDisposal:table.column.quantity')}
            </Th>
            <Th
              id="header-action"
              columnKey="action"
              className="ui-font-semibold"
            >
              {t('common:action')}
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {order_items?.map((item, index) => (
            <Fragment key={`material-selected-${item.material_id}`}>
              <Tr className="ui-text-sm ui-font-normal">
                <Td id="cell-no" className="ui-content-start ui-p-2">
                  {index + 1}
                </Td>
                <Td
                  id="cell-activity"
                  className="ui-content-start ui-p-2 ui-text-dark-teal"
                >
                  <p className="ui-font-bold ui-text-dark-teal ui-mb-[6px]">
                    {item.material_name ?? '-'}
                  </p>
                  <p>
                    {t('distributionDisposal:table.column.activity')}:{' '}
                    {item.activity_name}
                  </p>
                </Td>
                <Td
                  id="cell-stock-disposal"
                  className="ui-content-start ui-p-2 ui-text-dark-teal"
                >
                  {numberFormatter(item.ordered_qty, language)}
                </Td>
                <Td
                  id="cell-action"
                  className="ui-content-start ui-p-2 ui-text-dark-teal"
                >
                  <DistributionDisposalFormTableButtonBatch
                    index={index}
                    item={item}
                    setSelected={setSelected}
                  />

                  {!!errors?.order_items?.[index]?.is_valid?.message && (
                    <FormErrorMessage>
                      {t('common:validation.required')}
                    </FormErrorMessage>
                  )}
                </Td>
                <Td id="cell-" className="ui-content-start ui-p-2">
                  <Button
                    id={`btn-delete-${index}`}
                    size="sm"
                    variant="subtle"
                    color="danger"
                    className="ui-p-[6px]"
                    type="button"
                    onClick={() => handleRemove(item.material_id, index)}
                  >
                    {t('common:remove')}
                  </Button>
                </Td>
              </Tr>
            </Fragment>
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

export default DistributionDisposalFormTable
