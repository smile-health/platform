import React from 'react'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { Skeleton } from '#components/skeleton'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import { ChangeProfileFrom } from './components/ChangeProfileForm'
import { useAccountManagement } from './hooks/useAccountManagement'

export default function ChangeProfile(): JSX.Element {
  const { t } = useTranslation('account')
  const { data, isLoading } = useAccountManagement({ type: 'profile' })

  return (
    <AppLayout title={t('title.edit_profile')}>
      <Meta title={generateMetaTitle(t('title.edit_profile'))} />
      {isLoading ? (
        <div className="ui-border ui-rounded ui-border-[#d2d2d2] ui-mt-8 ui-p-4">
          <div className="ui-grid ui-grid-cols-2 ui-gap-x-4">
            {[1, 2, 3, 4, 5].map((index) => {
              return <Skeleton key={index} className="ui-h-16 ui-mb-5" />
            })}
          </div>

          <div className="ui-flex ui-justify-end">
            {[1, 2].map((index) => {
              return (
                <Skeleton key={index} className="ui-h-16 ui-w-[200px] ui-m-3" />
              )
            })}
          </div>
        </div>
      ) : (
        <ChangeProfileFrom data={data?.user} />
      )}
    </AppLayout>
  )
}
