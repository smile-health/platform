import React from 'react'
import { InfiniteScrollList } from '#components/infinite-scroll-list'
import { OptionType } from '#components/react-select'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { Stock } from '#types/stock'
import { getUserStorage } from '#utils/storage/user'
import { useTranslation } from 'react-i18next'

import { useOrderCreateMaterialTable } from '../hooks/useOrderCreateMaterialTable'

export type OrderCreateMaterialTableProps<T> = Readonly<{
  id: string
  search: string
  onSelectRow: (row: Stock) => void
  setSearch: React.Dispatch<React.SetStateAction<string>>
  showMaterialTable: boolean
  customer: OptionType | null
  activity: OptionType | null
}>

export default function OrderCreateMaterialTable<
  T extends Record<string, any>,
>({
  id,
  search,
  customer,
  activity,
  setSearch,
  onSelectRow,
  showMaterialTable,
}: OrderCreateMaterialTableProps<T>) {
  const { t } = useTranslation(['common', 'orderCreateReturn'])
  const userStorage = getUserStorage()

  const {
    stocks: itemList,
    generateSchema,
    fetchNextPage,
    hasNextPage,
    isFetching,
    totalItems,
  } = useOrderCreateMaterialTable({
    search,
    customer,
    activity,
  })

  useSetLoadingPopupStore(isFetching)

  return (
    <div className="ui-ml-6 ui-w-1/2 !ui-h-full">
      {showMaterialTable ? (
        <InfiniteScrollList
          id={`${id}-material-list`}
          title={`${t('orderCreateReturn:title.material_in')} ${customer?.label ?? userStorage?.entity?.name}`}
          description={t('orderCreateReturn:material_table.click_to_select')}
          data={itemList}
          hasNextPage={hasNextPage}
          totalItems={totalItems}
          fetchNextPage={fetchNextPage}
          handleSearch={(keyword) => {
            setSearch(keyword)
            fetchNextPage({ cancelRefetch: true })
          }}
          onClickRow={(row) => {
            if (row?.total_qty === 0) return
            else {
              onSelectRow(row)
            }
          }}
          columns={generateSchema}
          isLoading={isFetching}
        />
      ) : (
        <div className="ui-border ui-border-[#d2d2d2] ui-p-6 !ui-h-[32rem]">
          <div className="ui-font-bold">
            {t('orderCreateReturn:title.material_in')}{' '}
            {customer?.label ?? userStorage?.entity?.name}
          </div>
          {t('orderCreateReturn:material_table.complete_detail_transaction')}
        </div>
      )}
    </div>
  )
}
