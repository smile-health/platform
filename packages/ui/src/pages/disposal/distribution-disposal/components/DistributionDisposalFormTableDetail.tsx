import React, { Fragment } from 'react'
import { Button } from '#components/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '#components/drawer'
import { EmptyState } from '#components/empty-state'
import { Exists } from '#components/exists'
import Reload from '#components/icons/Reload'
import XMark from '#components/icons/XMark'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useModalWarningStore } from '../../../transaction/TransactionCreate/store/modal-warning.store'
import { createDistributionDisposalDetailFormSchema } from '../schemas/distribution-disposal.schema-form'
import {
  DistributionDisposalOrderItemForm,
  DistributionDisposalStockForm,
} from '../types/DistributionDisposal'
import DistributionDisposalFormStockExterminationsInputNumber from './DistributionDisposalFormStockExterminationsInputNumber'

type Props = {
  open: boolean
  handleClose: () => void
  data: DistributionDisposalOrderItemForm | null
  handleUpdateParent: (stocks: DistributionDisposalStockForm[]) => void
}
const DistributionDisposalFormTableDetail: React.FC<Props> = (props) => {
  const { open, handleClose, data, handleUpdateParent } = props
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'distributionDisposal'])
  const methods = useForm<{ stocks: DistributionDisposalStockForm[] }>({
    mode: 'onChange',
    defaultValues: {
      stocks: data?.stocks || [],
    },
    resolver: createDistributionDisposalDetailFormSchema(t),
  })
  const { setModalWarning } = useModalWarningStore()
  const { watch, reset, getValues, control } = methods
  const { stocks } = watch()

  const handleUpdateItems = async () => {
    const isValid = await methods.trigger()

    if (!isValid) {
      const {
        formState: { errors },
      } = methods

      if (
        errors.stocks?.root?.type === 'at-least-one-qty' ||
        errors.stocks?.type === 'at-least-one-qty' ||
        Object.keys(errors).length === 0
      ) {
        return setModalWarning(
          true,
          t('distributionDisposal:form.modal.warning_item')
        )
      }

      return
    }

    const values = getValues()
    handleUpdateParent(values.stocks)
    methods.reset({})
  }

  return (
    <FormProvider {...methods}>
      <form>
        <Drawer open={open} placement="bottom" sizeHeight="lg" size="full">
          <DrawerHeader>
            <div className="ui-flex ui-justify-between">
              <div />
              <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
                {Boolean(data?.managed_in_batch)
                  ? t('distributionDisposal:detail.action.batch_quantity')
                  : t('distributionDisposal:detail.action.quantity')}
              </h6>
              <Button
                variant="subtle"
                type="button"
                color="neutral"
                onClick={handleClose}
              >
                <XMark />
              </Button>
            </div>
          </DrawerHeader>
          <DrawerContent className="ui-border-y ui-border-b-zinc-300">
            <div
              className="ui-px-1 ui-py-2 ui-space-y-6"
              id="transaction-detail-table"
            >
              <div className="ui-grid ui-grid-cols-[40%_40%_20%] ui-gap-3 ui-mb-1">
                <div>
                  <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                    Material
                  </h2>
                  <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
                    {data?.material_name}
                  </p>
                </div>
                <div>
                  <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                    {t('distributionDisposal:table.column.total_discard')}
                  </h2>
                  <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
                    {numberFormatter(data?.ordered_qty, language)}
                  </p>
                </div>
                <div>
                  <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                    {t('distributionDisposal:table.column.activity')}
                  </h2>
                  <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
                    {data?.activity_name}
                  </p>
                </div>
              </div>
              <Table
                withBorder
                rounded
                hightlightOnHover
                overflowXAuto
                stickyOffset={0}
                empty={stocks.length === 0}
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
                    <Exists useIt={Boolean(data?.managed_in_batch)}>
                      <Th
                        id="header-batch-info"
                        columnKey="batch-info"
                        className="ui-font-semibold"
                      >
                        {t('distributionDisposal:table.column.batch_info')}
                      </Th>
                    </Exists>
                    <Th
                      id="header-activity"
                      columnKey="activity"
                      className="ui-font-semibold"
                    >
                      {t('distributionDisposal:table.column.activity')}
                    </Th>
                    <Th
                      id="header-stock-discard"
                      columnKey="stock-discard"
                      className="ui-font-semibold"
                    >
                      {t(
                        'distributionDisposal:form.table.column.stock_discard'
                      )}
                    </Th>
                    <Th
                      id="header-quantity-discard"
                      columnKey="quantity-discard"
                      className="ui-font-semibold ui-w-96"
                    >
                      {t(
                        'distributionDisposal:form.table.column.quantity_from_discard'
                      )}
                    </Th>
                    <Th
                      id="header-stock-received"
                      columnKey="stock-received"
                      className="ui-font-semibold"
                    >
                      {t(
                        'distributionDisposal:form.table.column.stock_received'
                      )}
                    </Th>
                    <Th
                      id="header-quantity-received"
                      columnKey="quantity-received"
                      className="ui-font-semibold ui-w-96"
                    >
                      {t(
                        'distributionDisposal:form.table.column.quantity_from_received'
                      )}
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {stocks?.map((item, index) => (
                    <Fragment key={`material-selected-${item.stock_id}`}>
                      <Tr className="ui-text-sm ui-font-normal">
                        <Td
                          id="cell-no"
                          className="ui-content-start ui-p-2 ui-text-dark-teal"
                        >
                          {index + 1}
                        </Td>
                        <Exists useIt={Boolean(data?.managed_in_batch)}>
                          <Td
                            id="cell-batch-info"
                            className="ui-content-start ui-p-2 ui-text-dark-teal"
                          >
                            <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
                              {item.batch?.code || '-'}
                            </p>
                            <p className="ui-mb-1">
                              {t(
                                'distributionDisposal:table.column.batch.production_date',
                                {
                                  value: parseDateTime(
                                    item.batch?.production_date || '-',
                                    'DD MMM YYYY'
                                  ).toUpperCase(),
                                }
                              )}
                            </p>
                            <p className="ui-mb-1">
                              {t(
                                'distributionDisposal:table.column.batch.manufacturer',
                                {
                                  value: item.batch?.manufacture_name || '-',
                                }
                              )}
                            </p>
                            <p className="ui-mb-1">
                              {t(
                                'distributionDisposal:table.column.batch.expired_date',
                                {
                                  value: parseDateTime(
                                    item.batch?.expired_date || '-',
                                    'DD MMM YYYY'
                                  ).toUpperCase(),
                                }
                              )}
                            </p>
                          </Td>
                        </Exists>
                        <Td
                          id="cell-activity"
                          className="ui-content-start ui-p-2ui-text-dark-teal"
                        >
                          {item.activity_name}
                        </Td>
                        <Td
                          id="cell-stock-discard"
                          className="ui-content-start ui-p-2 ui-text-dark-teal ui-bg-[#F5F5F4]"
                        >
                          {numberFormatter(
                            item.extermination_discard_qty,
                            language
                          )}
                        </Td>
                        <Td
                          id="cell-quantity-discard"
                          className="ui-content-start ui-p-2 ui-text-dark-teal ui-space-y-5"
                        >
                          <DistributionDisposalFormStockExterminationsInputNumber
                            stock_exterminations={item.stock_exterminations}
                            index={index}
                            id="input-extermination-discard"
                            name="discard_qty"
                            control={control}
                          />
                        </Td>
                        <Td
                          id="cell-stock-received"
                          className="ui-content-start ui-p-2 ui-text-dark-teal ui-bg-[#F5F5F4]"
                        >
                          {numberFormatter(
                            item.extermination_received_qty,
                            language
                          )}
                        </Td>
                        <Td
                          id="cell-quantity-received"
                          className="ui-content-start ui-p-2 ui-text-dark-teal ui-space-y-5"
                        >
                          <DistributionDisposalFormStockExterminationsInputNumber
                            stock_exterminations={item.stock_exterminations}
                            index={index}
                            id="input-extermination-received"
                            name="received_qty"
                            control={control}
                          />
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
          </DrawerContent>
          <DrawerFooter>
            <div className="ui-flex ui-gap-3">
              <Button
                variant="subtle"
                type="button"
                className="ui-mr-2"
                onClick={() => reset({ stocks: data?.stocks || [] })}
                leftIcon={<Reload />}
              >
                {t('common:reset')}
              </Button>
              <Button
                type="button"
                className="ui-w-48"
                onClick={handleUpdateItems}
              >
                {t('common:save')}
              </Button>
            </div>
          </DrawerFooter>
        </Drawer>
      </form>
    </FormProvider>
  )
}

export default DistributionDisposalFormTableDetail
