import { Fragment } from 'react'
import Link from 'next/link'
import { Button } from '#components/button'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { AssetTypeDetailInfoProps } from '../asset-type.type'
import useAssetTypeThresholdTable from '../hooks/useAssetTypeThresholdTable'
import { generateDetail } from '../utils/helper'
import AssetTypeSkeleton from './AssetTypeSkeleton'

export default function AssetDetailInfo(props: AssetTypeDetailInfoProps) {
  const { isLoading, data } = props
  const { t } = useTranslation(['assetType', 'common'])
  const { getAsLinkGlobal } = useSmileRouter()
  const hasTreshold = true

  const { generateAssetUtilization } = useAssetTypeThresholdTable()

  if (isLoading) {
    return <AssetTypeSkeleton />
  }
  const detail = generateDetail(t, data)

  const getEditUrl = () => {
    return getAsLinkGlobal(
      `/v5/global-settings/asset/type/${data?.id}/edit`,
      null,
      {
        fromPage: 'detail',
      }
    )
  }

  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
        <h5 className="ui-font-bold">{t('form.detail.header.detail')}</h5>
        <div className="ui-grid ui-grid-cols-1 ui-w-[150px] ui-justify-end">
          <Button
            asChild
            id="btn-link-asset-type-edit"
            variant="outline"
            onClick={() => {}}
          >
            <Link href={getEditUrl()}>{t('common:edit')}</Link>
          </Button>
        </div>
      </div>
      <RenderDetailValue data={detail} />
      {hasTreshold && (
        <Fragment>
          <hr className="ui-border ui-border-neutral-100 ui-my-4" />
          <h5 className="ui-font-bold">
            {t('form.detail.header.asset_utilization')}
          </h5>
          <RenderDetailValue data={generateAssetUtilization(data)} />
        </Fragment>
      )}
    </div>
  )
}
