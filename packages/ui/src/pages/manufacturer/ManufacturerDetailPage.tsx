import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { CommonType } from '#types/common'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import ManufacturerDetaiInfo from './components/ManufacturerDetail/ManufacturerDetailInfo'
import ManufacturerDetailProgram from './components/ManufacturerDetail/ManufacturerDetailProgram'
import {
  detailManufacturer,
  detailPlatformManufacturer,
} from './manufacturer.service'

export default function ManufacturerDetailPage({
  isGlobal,
}: Readonly<CommonType>) {
  const params = useParams()
  const { t } = useTranslation('manufacturer')

  const { data, isFetching } = useQuery({
    queryKey: ['manufacturer-detail', params?.id],
    queryFn: () =>
      isGlobal
        ? detailManufacturer(String(params?.id))
        : detailPlatformManufacturer(String(params?.id)),
    enabled: Boolean(params?.id),
  })

  useSetLoadingPopupStore(isFetching)

  const title = generateMetaTitle(t('title.manufacturer'), isGlobal)

  return (
    <AppLayout title={t('title.detail')}>
      <Meta title={title} />
      <div className="ui-space-y-6">
        <ManufacturerDetaiInfo
          isGlobal={isGlobal}
          isLoading={isFetching}
          data={data}
        />
        {isGlobal && (
          <ManufacturerDetailProgram
            isLoading={isFetching}
            programs={data?.programs}
          />
        )}
      </div>
    </AppLayout>
  )
}
