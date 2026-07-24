import AppLayout from '#components/layouts/AppLayout/AppLayout'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { CommonType } from '#types/common'
import { useTranslation } from 'react-i18next'

import ManufacturerForm from './components/ManufacturerForm'

export default function ManufacturerCreatePage({
  isGlobal,
}: Readonly<CommonType>) {
  const { t } = useTranslation('manufacturer')
  useSetLoadingPopupStore(false)

  return (
    <AppLayout title={t('title.create')}>
      <ManufacturerForm isGlobal={isGlobal} />
    </AppLayout>
  )
}
