import { Fragment } from "react"

import Plus from "#components/icons/Plus"
import { Button } from "#components/button"
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from "#components/table"
import { EmptyState } from "#components/empty-state"
import StockOpnameStockDetail from "./StockOpnameStockDetail"

import { createColumnStockOpname } from "../constants/table"
import { useStockOpnameStock } from "../hooks/useStockOpnameStock"
import { FormErrorMessage } from "#components/form-control"
import { numberFormatter } from "#utils/formatter"

const StockOpnameStock: React.FC = () => {
  const {
    t,
    language,
    openDetail,
    handleOpenDetail,
    handleCloseDetail,
    handleRemove,
    items,
    handleUpdateItems,
    createTitleActionBatch,
    getErrorMessage,
  } = useStockOpnameStock()

  const columns = createColumnStockOpname({ t })

  return (
    <div className="ui-mt-6">
      {openDetail.open && (
        <StockOpnameStockDetail
          open={openDetail.open}
          data={openDetail.data}
          handleClose={handleCloseDetail}
          handleUpdateItems={handleUpdateItems}
        />
      )}
      <Table
        withBorder
        rounded
        hightlightOnHover
        overflowXAuto
        stickyOffset={0}
        empty={items.length === 0}
        verticalAlignment="center"
      >
        <Thead>
          <Tr>
            {columns.map(column => (
              <Th
                id={`header-${column.id}`}
                key={column.id}
                columnKey={column.id}
                className="ui-w-10 ui-font-semibold"
                style={{
                  ...column.minSize && { minWidth: column.minSize },
                  ...column.size && { width: column.size },
                }}
              >
                {column.header}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {items?.map((item, index) => {
            const isUpdate = item.new_opname_stocks?.some(x => x.actual_qty)
            return (
              <Fragment key={`material-selected-${item.material_id}`}>
                <Tr className="ui-text-sm ui-font-normal">
                  <Td id={`cell-${columns[0].id}`} className="ui-content-start">{index + 1}</Td>
                  <Td id={`cell-${columns[1].id}`} className="ui-content-start">{item.material?.name}</Td>
                  <Td id={`cell-${columns[2].id}`}>
                    <div className="ui-flex ui-flex-col ui-gap-4">
                      {item.new_opname_stocks?.map(
                        (x, i) =>
                          typeof x.actual_qty === 'number' && (
                            <div
                              className="ui-space-y-1"
                              key={`detail-${x.id}-${i}`}
                            >
                              <p className="ui-text-dark-teal ui-text-sm">
                                {t(
                                  'stockOpnameCreate:form.transaction.description.stock.remaining_stock',
                                  { value: numberFormatter(x.recorded_qty, language) }
                                )}
                              </p>
                              <p className="ui-text-dark-teal ui-text-sm ui-font-bold">
                                {t(
                                  'stockOpnameCreate:form.transaction.description.stock.real_stock',
                                  { value: numberFormatter(x.actual_qty, language) }
                                )}
                              </p>
                            </div>
                          )
                      )}

                      <Button
                        onClick={() => handleOpenDetail(index, item)}
                        leftIcon={isUpdate ? undefined : <Plus className="h-5 w-5" />}
                        type="button"
                        variant="outline"
                        className="ui-w-max"
                      >
                        {createTitleActionBatch(item.is_batch, isUpdate)}
                      </Button>
                    </div>
                    {getErrorMessage(index) && (
                      <FormErrorMessage className="ui-mt-2">
                        {getErrorMessage(index)}
                      </FormErrorMessage>
                    )}
                  </Td>
                  <Td id={`cell-${columns[3].id}`} className="ui-content-start">
                    <Button
                      id={`btn-delete-${index}`}
                      size="sm"
                      variant="subtle"
                      color="danger"
                      className="ui-p-[6px]"
                      onClick={() => handleRemove(index)}
                    >
                      {t('common:remove')}
                    </Button>
                  </Td>
                </Tr>
              </Fragment>
            )
          })}
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

export default StockOpnameStock