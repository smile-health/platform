import React, { useState } from 'react'
import { InfiniteScrollList } from '#components/infinite-scroll-list'
import { useTranslation } from 'react-i18next'

import { useMaterialSelect } from '../hooks/useMaterialSelect'

const ReconciliationMaterilSelectForm = () => {
  const { t } = useTranslation('reconciliation')
  const [search, setSearch] = useState('')
  const {
    handleTitle,
    stocks,
    hasNextPage,
    fetchNextPage,
    checkStatusMaterial,
    generateSchema,
    isFetching,
    handleChangeMaterial,
  } = useMaterialSelect({ search })
  return (
    <div className="ui-w-full">
      <InfiniteScrollList
        id="list-material-reconciliation-create"
        title={handleTitle()}
        description={t('create.caption_choose_material')}
        data={stocks}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        handleSearch={(keyword) => {
          setSearch(keyword)
        }}
        onClickRow={(row) => {
          const statusChecked = checkStatusMaterial(row)
          handleChangeMaterial(
            !statusChecked
              ? {
                  id: row.material?.id,
                  name: row.material?.name,
                }
              : null
          )
        }}
        columns={generateSchema}
        isLoading={isFetching}
        config={{
          searchBar: {
            show: true,
            placeholder: t('create.search_material'),
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
export default ReconciliationMaterilSelectForm
