import React, { useContext } from 'react'
import { InfiniteScrollList } from '#components/infinite-scroll-list'
import { createColumnMaterial } from '../constants/table'
import { useStockOpnameSelectMaterial } from '../hooks/useStockOpnameSelectMaterial'
import { StockOpnameMaterialContext } from '../context/StockOpnameContext'

const StockOpameMaterial: React.FC = () => {
  const {
    isHierarchical
  } = useContext(StockOpnameMaterialContext)
  const {
    t,
    language,
    handleChooseMaterial,
    stocks,
    fetchNextPage,
    hasNextPage,
    isFetching,
    setSearch,
    classRow,
    checkStatusMaterial,
    description,
  } = useStockOpnameSelectMaterial({ isHierarchical })

  return (
    <div className="ui-w-full ui-border ui-border-gray-300 ui-rounded">
      <InfiniteScrollList
        id="list-material-stock-opname-create"
        title={isHierarchical ? t('form.material.title') : 'Material'}
        description={description}
        data={stocks}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage as any}
        handleSearch={setSearch}
        onClickRow={handleChooseMaterial}
        columns={createColumnMaterial({ t, language, classRow, checkStatusMaterial })}
        isLoading={isFetching}
        totalItems={stocks?.length}
        config={{
          searchBar: {
            show: true,
            placeholder: t('form.material.table.search', { returnObjects: true })[isHierarchical ? 0 : 1],
          },
          totalItems: {
            show: true,
          },
        }}
      />
    </div>
  )
}

export default StockOpameMaterial