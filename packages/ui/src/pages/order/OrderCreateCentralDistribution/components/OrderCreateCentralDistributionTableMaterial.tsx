import { H5 } from '#components/heading'
import { InfiniteScrollList } from '#components/infinite-scroll-list'
import { getUserStorage } from '#utils/storage/user'
import {
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  useFormContext,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import useEntityMaterialSelection from '../hooks/useEntityMaterialSelection'
import useEntityMaterialsList from '../hooks/useEntityMaterialsList'
import { TOrderFormValues } from '../order-create-central-distribution.type'

type Props = {
  append: UseFieldArrayAppend<TOrderFormValues>
  remove: UseFieldArrayRemove
}

export default function OrderCreateCentralDistributionTableMaterial(
  props: Readonly<Props>
) {
  const { append, remove } = props
  const user = getUserStorage()
  const { t } = useTranslation('orderCentralDistribution')

  const { watch } = useFormContext<TOrderFormValues>()

  const { vendor, customer, activity } = watch()

  const {
    stocks,
    tableSchema,
    fetchNextPage,
    hasNextPage,
    setKeyword,
    isFetching,
    totalItems,
  } = useEntityMaterialsList()

  const { handleClickTableRow } = useEntityMaterialSelection({
    append,
    remove,
  })
  const title = t('section.material', {
    form: vendor?.label ?? user?.entity?.name,
  })

  return (
    <div className="ui-p-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-6 !ui-h-full">
      {vendor && customer && activity ? (
        <InfiniteScrollList
          id="order-create-material-list"
          title={title}
          description={t('info.material.available')}
          data={stocks}
          totalItems={totalItems}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          handleSearch={(keyword) => {
            setKeyword(keyword)
            fetchNextPage({ cancelRefetch: true })
          }}
          onClickRow={handleClickTableRow}
          columns={tableSchema}
          isLoading={isFetching}
        />
      ) : (
        <div>
          <H5>{title}</H5>
          <p className="ui-text-neutral-500">{t('info.material.empty')}</p>
        </div>
      )}
    </div>
  )
}
