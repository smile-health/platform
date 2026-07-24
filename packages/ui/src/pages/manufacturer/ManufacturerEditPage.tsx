'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { CommonType } from '#types/common'
import { useTranslation } from 'react-i18next'

import ManufacturerForm from './components/ManufacturerForm'
import ManufacturerLoading from './components/ManufacturerLoading'
import { detailManufacturer } from './manufacturer.service'

export default function ManufacturerEditPage({
  isGlobal,
}: Readonly<CommonType>): JSX.Element {
  const params = useParams()
  const { t } = useTranslation('manufacturer')

  const { data, isFetching } = useQuery({
    queryKey: ['manufacturer-detail', params?.id],
    queryFn: () => detailManufacturer(Number(params?.id)),
    enabled: Boolean(params?.id),
  })

  useSetLoadingPopupStore(isFetching)

  return (
    <AppLayout title={t('title.edit')}>
      <div className="mt-6">
        {!data || isFetching ? (
          <ManufacturerLoading />
        ) : (
          <ManufacturerForm manufacturer={data} isEdit isGlobal={isGlobal} />
        )}
      </div>
    </AppLayout>
  )
}
