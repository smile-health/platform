import { Fragment } from 'react'
import { Button } from '#components/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '#components/drawer'
import { EmptyState } from '#components/empty-state'
import { FormControl, FormErrorMessage } from '#components/form-control'
import Plus from '#components/icons/Plus'
import Reload from '#components/icons/Reload'
import XMark from '#components/icons/XMark'
import { InputNumberV2 } from '#components/input-number-v2'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import cx from '#lib/cx'
import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { Controller, FormProvider } from 'react-hook-form'

import { createColumnStockOpnameDetail } from '../constants/table'
import { useStockOpnameStockDetail } from '../hooks/useStockOpnameStockDetail'
import { NewOpnameItems, NewOpnameStocks } from '../types'
import StockOpnameModalAddBatch from './StockOpnameModalAddBatch'
import StockOpnameModalConfirmation from './StockOpnameModalConfirmation'

type Props = {
  data: NewOpnameItems | null
  handleClose: () => void
  open: boolean
  handleUpdateItems: (data: NewOpnameStocks[]) => void
}

const StockOpnameStockDetail: React.FC<Props> = (props) => {
  const { data, handleClose, open, handleUpdateItems } = props
  const {
    t,
    language,
    methods,
    handleSubmit,
    handleAddStock,
    handleReset,
    new_opname_stocks,
    modalNewBatch,
    handleCloseModalNewBatch,
    handleSubmitBatch,
    isHierarchical,
    getActivities,
    modalConfrimationStock,
    setModalConfirmationStock,
    handleFinalSubmit,
  } = useStockOpnameStockDetail({ data, handleUpdateItems })

  const columns = createColumnStockOpnameDetail({ t })
  const title = t('stockOpnameCreate:form.transaction.drawer.title', {
    returnObjects: true,
  })
  const description = t(
    'stockOpnameCreate:form.transaction.drawer.description',
    { returnObjects: true }
  )

  return (
    <Fragment>
      {modalNewBatch.open && (
        <StockOpnameModalAddBatch
          open={modalNewBatch.open}
          handleClose={handleCloseModalNewBatch}
          data={{
            material_id: data?.material_id || 0,
            activities: getActivities(),
            is_batch: data?.is_batch || false,
          }}
          handleSubmitBatch={handleSubmitBatch}
          new_opname_stock={new_opname_stocks}
        />
      )}
      {modalConfrimationStock && (
        <StockOpnameModalConfirmation
          open={modalConfrimationStock}
          handleClose={() => setModalConfirmationStock(false)}
          handleSubmit={handleFinalSubmit}
          description={
            <div className="ui-flex ui-flex-col ui-space-y-3 ui-items-center ui-text-center">
              <div className="ui-text-neutral-500">
                {t('stockOpnameCreate:modal_confirmation_stock.desc_one')}
              </div>
              <div className="ui-text-dark-blue ui-font-medium">
                {t('stockOpnameCreate:modal_confirmation_stock.desc_two')}
              </div>
            </div>
          }
          buttonProps={{
            cancel: { variant: undefined },
            submit: { variant: 'outline' },
          }}
        />
      )}
      <FormProvider {...methods}>
        <form>
          <Drawer
            id="drawer-batch"
            closeOnOverlayClick={false}
            open={open}
            placement="bottom"
            sizeHeight="lg"
            size="full"
            className="ui-z-10"
          >
            <DrawerHeader>
              <div className="ui-flex ui-justify-between">
                <div />
                <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
                  {data?.is_batch ? title[0] : title[1]}
                </h6>
                <Button
                  variant="subtle"
                  type="button"
                  color="neutral"
                  onClick={() => {
                    handleReset()
                    handleClose()
                  }}
                >
                  <XMark />
                </Button>
              </div>
            </DrawerHeader>
            <DrawerContent className="ui-border-y ui-border-b-zinc-300">
              <div
                className="ui-px-1 ui-py-2"
                id="transaction-detail-table-stock-opname"
              >
                <div className="ui-space-y-6">
                  <div className="ui-grid ui-grid-cols-[40%_40%_20%] ui-gap-4 ui-mb-1">
                    <div>
                      <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                        {isHierarchical ? description[0] : 'Material'}
                      </h2>
                      <p className="ui-font-bold ui-text-primary-800 ui-break-normal">
                        {isHierarchical
                          ? data?.parent_material?.name || '-'
                          : data?.material?.name || '-'}
                      </p>
                    </div>
                    {isHierarchical && (
                      <div>
                        <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                          {description[1]}
                        </h2>
                        <p className="ui-font-bold ui-text-primary-800 ui-break-normal">
                          {data?.material?.name || '-'}
                        </p>
                      </div>
                    )}
                    <div>
                      <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                        {description[2]}
                      </h2>
                      <p className="ui-font-bold ui-text-primary-800">
                        {numberFormatter(data?.total_available_qty, language)}
                      </p>
                    </div>
                  </div>
                  <Table
                    withBorder
                    rounded
                    hightlightOnHover
                    overflowXAuto
                    stickyOffset={0}
                    empty={new_opname_stocks.length === 0}
                    verticalAlignment="center"
                  >
                    <Thead className="ui-bg-slate-100">
                      <Tr>
                        {columns.map((column) => (
                          <Th
                            id={`header-${column.id}`}
                            columnKey={column.id}
                            key={column.id}
                            className="ui-w-10 ui-font-semibold"
                            style={{
                              ...(column.minSize && {
                                minWidth: column.minSize,
                              }),
                            }}
                          >
                            {column.header}
                          </Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody className="ui-bg-white">
                      {new_opname_stocks?.map((item, index) => (
                        <Tr
                          key={`material-detail-${item.material_id}`}
                          className="ui-text-sm ui-font-normal"
                        >
                          <Td
                            id={`cell-${columns[0].id}`}
                            className="ui-content-start"
                          >
                            {index + 1}
                          </Td>
                          <Td
                            id={`cell-${columns[1].id}`}
                            className="ui-content-start"
                          >
                            <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
                              {item.batch?.code || '-'}
                            </p>
                            <p className="ui-mb-1">
                              {t(
                                'stockOpnameCreate:form.transaction.description.batch.production_date',
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
                                'stockOpnameCreate:form.transaction.description.batch.manufacturer',
                                {
                                  value: item.batch?.manufacture?.name || '-',
                                }
                              )}
                            </p>
                            <p className="ui-mb-1">
                              {t(
                                'stockOpnameCreate:form.transaction.description.batch.expired_date',
                                {
                                  value: parseDateTime(
                                    item.batch?.expired_date || '-',
                                    'DD MMM YYYY'
                                  ).toUpperCase(),
                                }
                              )}
                            </p>
                          </Td>
                          <Td
                            id={`cell-${columns[2].id}`}
                            className="ui-content-start"
                          >
                            {item?.activity?.name || '-'}
                          </Td>
                          <Td
                            id={`cell-${columns[3].id}`}
                            className="ui-content-start"
                          >
                            {numberFormatter(item.recorded_qty || 0, language)}
                          </Td>
                          <Td
                            id={`cell-${columns[4].id}`}
                            className="ui-content-start"
                          >
                            {numberFormatter(
                              item.in_transit_qty || 0,
                              language
                            )}
                          </Td>
                          <Td
                            id={`cell-${columns[5].id}`}
                            className="ui-content-start"
                          >
                            <Controller
                              control={methods.control}
                              name={`new_opname_stocks.${index}.actual_qty`}
                              render={({
                                field: { value, onChange },
                                fieldState: { error },
                              }) => (
                                <FormControl>
                                  <InputNumberV2
                                    id={`new_opname_stocks.${index}.actual_qty`}
                                    placeholder={t(
                                      'stockOpnameCreate:form.transaction.placeholder.qty'
                                    )}
                                    value={(value as unknown as number) ?? ''}
                                    onValueChange={(e) => {
                                      onChange(e.floatValue)
                                      if (error?.message)
                                        methods.clearErrors(
                                          `new_opname_stocks.${index}.actual_qty`
                                        )
                                    }}
                                    error={!!error?.message}
                                    maxLength={11}
                                  />
                                  {error?.message && (
                                    <FormErrorMessage>
                                      {error?.message}
                                    </FormErrorMessage>
                                  )}
                                </FormControl>
                              )}
                            />
                          </Td>
                          {/* <Td id={`cell-${columns[6].id}`}>
                            <Button
                              id={`btn-delete-${index}`}
                              size="sm"
                              variant="subtle"
                              color="primary"
                              className="ui-p-[6px] ui-text-polynesianblue-600"
                              onClick={() => handleDeleteStock(index)}
                            >
                              {t('common:delete')}
                            </Button>
                          </Td> */}
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
                  <div
                    className={cx('ui-flex', {
                      'ui-justify-between': data?.is_batch,
                    })}
                  >
                    <Button
                      onClick={handleAddStock}
                      leftIcon={<Plus className="h-5 w-5" />}
                      type="button"
                      variant="outline"
                    >
                      {data?.is_batch ? 'Batch' : 'Detail'}
                    </Button>
                  </div>
                </div>
              </div>
            </DrawerContent>
            <DrawerFooter>
              <div className="ui-flex ui-gap-3">
                <Button
                  variant="subtle"
                  type="button"
                  className="ui-mr-2"
                  onClick={handleReset}
                  leftIcon={<Reload />}
                >
                  {t('common:reset')}
                </Button>
                <Button
                  type="button"
                  className="ui-w-48"
                  onClick={handleSubmit}
                >
                  {t('common:save')}
                </Button>
              </div>
            </DrawerFooter>
          </Drawer>
        </form>
      </FormProvider>
    </Fragment>
  )
}

export default StockOpnameStockDetail
