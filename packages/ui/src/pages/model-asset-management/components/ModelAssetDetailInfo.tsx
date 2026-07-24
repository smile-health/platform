import Link from 'next/link'
import { Button } from '#components/button'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import { BOOLEAN } from '#constants/common'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { ModelAssetDetailInfoProps } from '../asset-model.type'
import useModelAssetCapacityTable from '../hooks/useModelAssetCapacityTable'
import { generateDetail } from '../utils/helper'
import ModelAssetSkeleton from './ModelAssetSkeleton'

export default function ModelAssetDetailInfo(props: ModelAssetDetailInfoProps) {
  const { isLoading, data } = props
  const { t } = useTranslation(['modelAsset', 'common'])
  const { getAsLinkGlobal } = useSmileRouter()

  const { generateCapacityTable } = useModelAssetCapacityTable(data)

  if (isLoading) {
    return <ModelAssetSkeleton />
  }

  const detail = generateDetail(t, data)
  const getEditUrl = () => {
    return getAsLinkGlobal(
      `/v5/global-settings/asset/model/${data?.id}/edit`,
      null,
      {
        fromPage: 'detail',
      }
    )
  }

  const isWarehouse = data?.is_warehouse === BOOLEAN.TRUE

  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
        <h5 className="ui-font-bold">Details</h5>
        <div className="ui-grid ui-grid-cols-1 ui-w-[150px] ui-justify-end">
          <Button
            asChild
            id={`btn-link-model-asset-edit-${data?.id}`}
            variant="outline"
            onClick={() => {}}
          >
            <Link href={getEditUrl()}>{t('common:edit')}</Link>
          </Button>
        </div>
      </div>
      <RenderDetailValue data={detail} />
      {!isWarehouse && (
        <>
          {Boolean(data?.capacities?.length) &&
            generateCapacityTable('capacity')}
          {Boolean(data?.net_capacities_who?.length) &&
            generateCapacityTable('capacity_pqs')}
        </>
      )}
    </div>
  )
}
