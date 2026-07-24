'use client'

import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import useSmileRouter from '#hooks/useSmileRouter'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import MaterialFormGlobal from './components/MaterialFormGlobal'

const MaterialCreatePage = (): JSX.Element => {
  usePermission('material-global-mutate')
  const { t } = useTranslation(['material', 'common'])
  const router = useSmileRouter()

  return (
    <AppLayout
      title={t('title.create')}
      backButton={{
        label: t('common:back_to_list'),
        show: true,
        onClick: () => {
          router.back()
        },
      }}
    >
      <Meta title={generateMetaTitle(t('title.create'), true)} />
      <div className="mt-6">
        <MaterialFormGlobal isGlobal />
      </div>
    </AppLayout>
  )
}

export default MaterialCreatePage
