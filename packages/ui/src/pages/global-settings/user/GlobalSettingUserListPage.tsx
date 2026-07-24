'use client'

import { useRouter } from 'next/navigation'
import UserListPage from '#pages/user/UserListPage'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import GlobalSettings from '../GlobalSettings'

const GlobalSettingUserListPage = () => {
  const router = useRouter()
  const {
    t,
    i18n: { language },
  } = useTranslation('user')

  return (
    <GlobalSettings
      title={t('title.list.management')}
      showButtonCreate={hasPermission('user-global-mutate')}
      buttonCreate={{
        label: t('title.add'),
        onClick: () =>
          router.push(`/${language}/v5/global-settings/user/create`),
      }}
    >
      <UserListPage isGlobal />
    </GlobalSettings>
  )
}

export default GlobalSettingUserListPage
