import React from 'react'
import { InfiniteScrollList } from '#components/infinite-scroll-list'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { getUserStorage } from '#utils/storage/user'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useOrderCreateMaterialSelect } from '../../hooks/useOrderCreateMaterialSelect'
import { TOrderCreateForm } from '../../order-create.type'
import { mapStock } from '../../utils'

export type OrderCreateMaterialTableProps = Readonly<{
  search: string
  setSearch: React.Dispatch<React.SetStateAction<string>>
}>

export default function OrderCreateMaterialTable({
  search,
  setSearch,
}: OrderCreateMaterialTableProps) {
  const { t } = useTranslation(['common', 'orderCreate'])
  const userStorage = getUserStorage()

  const { watch, control, clearErrors } = useFormContext<TOrderCreateForm>()
  const { append, remove, fields } = useFieldArray({
    control,
    name: 'order_items',
  })

  const { customer_id, vendor_id, activity_id, order_items } = watch()

  const {
    checkStatusMaterial,
    stocks: itemList,
    generateSchema,
    fetchNextPage,
    hasNextPage,
    isFetching,
    totalItem,
  } = useOrderCreateMaterialSelect({
    watch,
    search,
    customer_id: customer_id?.value,
  })

  useSetLoadingPopupStore(isFetching)

  return (
    <div className="ui-ml-6 ui-w-1/2 !ui-h-full">
      {customer_id && vendor_id && activity_id ? (
        <InfiniteScrollList
          id="order-create-material-list"
          title={`${t('orderCreate:title.material_in')} ${customer_id?.label ?? userStorage?.entity?.name}`}
          description={t('orderCreate:material_table.click_to_select')}
          data={itemList}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          handleSearch={(keyword) => {
            setSearch(keyword)
            fetchNextPage({ cancelRefetch: true })
          }}
          totalItems={totalItem as unknown as number}
          onClickRow={(row) => {
            const status = checkStatusMaterial(row)
            const indexToCheck = order_items.findIndex(
              (orderItem) => orderItem?.value?.material_id === row?.material?.id
            )
            if (!status) {
              if (order_items.length === 0) {
                clearErrors('order_items')
              }
              append?.(mapStock(row), { shouldFocus: false })
            } else if (indexToCheck !== -1) {
              remove?.(indexToCheck)
              clearErrors(`order_items.${indexToCheck}.value.other_reason`)
              clearErrors(`order_items.${indexToCheck}.value.order_reason_id`)
              clearErrors(`order_items.${indexToCheck}.value.ordered_qty`)
            }
          }}
          columns={generateSchema}
          isLoading={isFetching}
        />
      ) : (
        <div className="ui-border ui-border-[#d2d2d2] ui-p-6 !ui-h-[32rem]">
          <div className="ui-font-bold">
            {t('orderCreate:title.material_in')}{' '}
            {customer_id?.label ?? userStorage?.entity?.name}
          </div>
          {t('orderCreate:material_table.complete_detail_transaction')}
        </div>
      )}
    </div>
  )
}
