'use client'

import { FC } from 'react'
import { useParams } from 'next/navigation'
import { useQueries } from '@tanstack/react-query'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { listUserChangeHistory } from '#services/user'
import { CommonType } from '#types/common'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import UserDetailChangeHistory from './components/UserDetail/UserDetailChangeHistory'
import UserDetailEntityInfo from './components/UserDetail/UserDetailEntityInfo'
import UserDetailLogInfo from './components/UserDetail/UserDetailLogInfo'
import UserDetailMainInfo from './components/UserDetail/UserDetailMainInfo'
import UserDetailProgram from './components/UserDetail/UserDetailProgram'
import { generateUserDetail } from './user.helper'
import {
  detailPlatformUser,
  detailUser,
  listUserPlatformChangeHistory,
} from './user.service'

const UserDetailPage: FC<CommonType> = ({ isGlobal }): JSX.Element => {
  usePermission(isGlobal ? 'user-global-view' : 'user-view')
  const { t } = useTranslation(['common', 'user'])
  const params = useParams()

  const [userDetail, userHistory] = useQueries({
    queries: [
      {
        queryKey: ['user-detail', params?.id],
        queryFn: () =>
          isGlobal
            ? detailUser(Number(params?.id))
            : detailPlatformUser(Number(params?.id)),
        enabled: Boolean(params?.id),
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ['user-history'],
        queryFn: () =>
          isGlobal
            ? listUserChangeHistory(Number(params?.id))
            : listUserPlatformChangeHistory(Number(params?.id)),
        enabled: Boolean(params?.id),
        refetchOnWindowFocus: false,
      },
    ],
  })

  const detail = generateUserDetail(t, userDetail?.data)

  useSetLoadingPopupStore(userDetail?.isFetching || userHistory?.isFetching)

  return (
    <AppLayout title={t('user:title.detail')}>
      <Meta title={generateMetaTitle(t('user:title.user'), isGlobal)} />
      <div className="ui-space-y-6">
        <UserDetailMainInfo
          id={detail?.id}
          status={detail?.status}
          detail={detail?.main}
          isGlobal={isGlobal}
          isLoading={userDetail?.isFetching}
        />

        <UserDetailLogInfo
          data={detail?.log}
          isLoading={userDetail?.isFetching}
        />

        <UserDetailEntityInfo
          data={detail?.entity}
          isLoading={userDetail?.isFetching}
        />

        {isGlobal && (
          <UserDetailProgram
            data={userDetail?.data}
            isLoading={userDetail?.isFetching}
          />
        )}

        {(userHistory?.data?.length as number) > 0 && (
          <UserDetailChangeHistory data={userHistory?.data} />
        )}
      </div>
    </AppLayout>
  )
}

export default UserDetailPage
