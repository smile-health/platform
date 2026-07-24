'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import UserForm from './components/UserForm'
import UserSkeleton from './components/UserSkeleton'
import { detailUser } from './user.service'

const UserEditPage = (): JSX.Element => {
  usePermission('user-global-mutate')
  const { t } = useTranslation('user')
  const params = useParams()

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['user-edit', params?.id],
    queryFn: () => detailUser(Number(params?.id)),
    enabled: Boolean(params?.id),
  })

  useSetLoadingPopupStore(isLoading || isFetching)

  return (
    <AppLayout title={t('title.user')}>
      <Meta title={generateMetaTitle(t('title.user'), true)} />
      <div className="mt-6 space-y-6">
        {isLoading || isFetching ? (
          <UserSkeleton />
        ) : (
          <UserForm defaultValues={data} />
        )}
      </div>
    </AppLayout>
  )
}

export default UserEditPage
