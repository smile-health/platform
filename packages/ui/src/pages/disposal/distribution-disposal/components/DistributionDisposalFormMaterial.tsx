import React from 'react'
import { InfiniteScrollList } from '#components/infinite-scroll-list'

import { useDistributionDisposalFormMaterial } from '../hooks/useDistributionDisposalFormMaterial'

const DistributionDisposalFormMaterial: React.FC = () => {
  const {
    t,
    handleChooseMaterial,
    generateSchema,
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    setSearch,
    senderName,
  } = useDistributionDisposalFormMaterial()

  const stocks = data?.pages.map((page) => page.data).flat()

  return (
    <div className="ui-w-full">
      <InfiniteScrollList
        id="list-material-disposal-create"
        title={t('distributionDisposal:form.material.title', {
          sender: senderName,
        })}
        description={t('distributionDisposal:form.material.description')}
        data={stocks}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        handleSearch={(keyword) => {
          setSearch(keyword)
        }}
        onClickRow={(row) => handleChooseMaterial(row)}
        columns={generateSchema}
        isLoading={isFetching}
        config={{
          searchBar: {
            show: true,
            placeholder: t('distributionDisposal:form.material.search'),
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

export default DistributionDisposalFormMaterial
