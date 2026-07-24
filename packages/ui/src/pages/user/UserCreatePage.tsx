'use client'

import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import UserForm from './components/UserForm'

const UserCreatePage = (): JSX.Element => {
  const { t } = useTranslation('user')
  usePermission('user-global-mutate')

  useSetLoadingPopupStore(false)

  return (
    <AppLayout title={t('title.user')}>
      <Meta title={generateMetaTitle(t('title.user'), true)} />
      <div className="mt-6">
        <UserForm />
      </div>
    </AppLayout>
  )
}

export default UserCreatePage
