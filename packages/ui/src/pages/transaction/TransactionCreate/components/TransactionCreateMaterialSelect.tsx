import React, { useState } from 'react'
import { InfiniteScrollList } from '#components/infinite-scroll-list'
import { useTranslation } from 'react-i18next'

import { useCreateMaterialSelect } from '../hooks/useCreateMaterialSelect'

export const TransactionCreateMaterialSelect = () => {
  const [search, setSearch] = useState('')
  const { t } = useTranslation('transactionCreate')
  const {
    generateSchema,
    stocks,
    hasNextPage,
    fetchNextPage,
    isFetching,
    handleTitle,
    checkStatusMaterial,
    handleRemoveMaterial,
    handleChooseMaterial,
    setDisabledMaterialStockZero,
    setDisabledMaterialActivityIsNotAvailable,
    type,
    TRANSACTION_TYPE,
  } = useCreateMaterialSelect({ search })

  return (
    <div className="ui-w-full">
      <InfiniteScrollList
        id="list-material-transaction-create"
        title={handleTitle()}
        description={t('caption_choose_material')}
        warning_description={
          Number(type) === TRANSACTION_TYPE.TRANSFER_STOCK
            ? t('transaction_transfer_stock.table_material.warning')
            : undefined
        }
        emptyDescription={
          Number(type) === TRANSACTION_TYPE.TRANSFER_STOCK
            ? t('transaction_transfer_stock.empty_material')
            : undefined
        }
        data={stocks}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        handleSearch={(keyword) => {
          setSearch(keyword)
        }}
        onClickRow={(row) => {
          const statusChecked = checkStatusMaterial(row)
          const disabledClick =
            setDisabledMaterialStockZero(
              Number(row.aggregate?.total_available_qty)
            ) || setDisabledMaterialActivityIsNotAvailable(row)
          if (!disabledClick) {
            if (statusChecked) handleRemoveMaterial(row)
            else handleChooseMaterial(row)
          }
        }}
        columns={generateSchema}
        isLoading={isFetching}
        config={{
          searchBar: {
            show: true,
            placeholder: t('search_material'),
          },
          totalItems: {
            show: true,
          },
        }}
        totalItems={stocks?.length}
      />
    </div>
  )
}
