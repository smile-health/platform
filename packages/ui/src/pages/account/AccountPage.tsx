import React from 'react'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { ProgramItem } from '#components/modules/ProgramItem'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import { ChangeHistoryCard } from './components/ChangeHistoryCard'
import DetailComponent from './components/DetailComponent'
import DetailComponentLoadingState from './components/DetailComponentLoadingState'
import { useAccountManagement } from './hooks/useAccountManagement'
import { IconPrograms } from '#constants/program'

export type UpdateListFieldType = {
  label: string
  value: string | number
}

export default function AccountPage(): JSX.Element {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'account'])

  const {
    data,
    isLoading,
    profileDetailFields,
    deviceAndLoginInfoFields,
    workspacesDetailFields,
  } = useAccountManagement()

  if (isLoading) {
    return (
      <div>
        <DetailComponentLoadingState
          id="loadingUserDetailInfo"
          fields={profileDetailFields}
        />
        <DetailComponentLoadingState
          id="loadingUserDeviceInfo"
          fields={deviceAndLoginInfoFields}
        />
        <DetailComponentLoadingState
          id="loadingWorkspacesDetailInfo"
          fields={workspacesDetailFields}
        />
        <DetailComponentLoadingState
          id="loadingUserChangeHistoryInfo"
          amount={2}
        />
      </div>
    )
  }

  return (
    <AppLayout
      showActionButton
      actionButtons={[
        {
          label: t('account:button.edit_profile'),
          url: `/${language}/v5/account/change-profile`,
          id: 'btnEditProfile',
        },
        {
          label: t('account:button.edit_password'),
          url: `/${language}/v5/account/change-password`,
          id: 'btnEditPassword',
        },
      ]}
      title={t('account:title.profile_title')}
    >
      <Meta title={generateMetaTitle(t('account:title.profile_title'))} />
      <div>
        <DetailComponent id="userDetailInfo" fields={profileDetailFields} />
        <DetailComponent
          id="userDeviceInfo"
          fields={deviceAndLoginInfoFields}
        />

        <div
          className="ui-border ui-rounded ui-border-[#d2d2d2] ui-mt-6 ui-w-full ui-p-4"
          id="workspacesDetailInfo"
        >
          <div className="ui-mb-4 ui-font-bold">
            {workspacesDetailFields?.title}
          </div>

          <div className="ui-grid ui-grid-cols-4 ui-gap-4 ui-mb-4">
            {data?.user?.programs?.map((item) => {
              return (
                <ProgramItem
                  id={item?.name}
                  key={item.id}
                  data={item}
                  className={{
                    wrapper:
                      'ui-border ui-border-neutral-300 ui-rounded-lg ui-p-4 ui-gap-4 !ui-cursor-default',
                    logo: 'ui-w-8 ui-h-8',
                    title: 'ui-text-left'
                  }}
                  icon={IconPrograms[item.key]}
                  sizeIcon={32}
                />
              )
            })}
          </div>
          <div>
            <RenderDetailValue data={workspacesDetailFields?.fields} />
          </div>
        </div>

        {data?.userHistory && data?.userHistory?.length > 0 ? (
          <div
            className="ui-border ui-rounded ui-border-[#d2d2d2] ui-mt-6 ui-p-4"
            id="userChangeHistoryInfo"
          >
            <div className="ui-mb-4 ui-font-bold">
              {t('account:title.history_change_data')}
            </div>

            <div className="ui-space-y-4">
              {data?.userHistory?.map((item) => (
                <ChangeHistoryCard key={item.id} history={item} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </AppLayout>
  )
}
