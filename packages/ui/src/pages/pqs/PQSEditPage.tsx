'use client'

import { FC } from 'react'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { CommonType } from '#types/common'

import PQSForm from './components/PQSForm'
import PQSSkeleton from './components/PQSSkeleton'
import { usePQSDetail } from './hooks/usePQSDetail'

const PQSEditPage: FC<CommonType> = ({ isGlobal = true }): JSX.Element => {
  usePermission('pqs-global-mutate')
  const { isLoading, defaultValue, t, handleBackToList } = usePQSDetail()

  useSetLoadingPopupStore(isLoading)

  return (
    <AppLayout
      title={t('pqs:title.detail')}
      backButton={{
        show: true,
        onClick: handleBackToList,
      }}
    >
      <Meta title={`Smile | Global ${t('pqs:title.edit')}`} />
      <div className="ui-space-y-6">
        {isLoading ? (
          <PQSSkeleton />
        ) : (
          <PQSForm defaultValues={defaultValue} isGlobal={isGlobal} />
        )}
      </div>
    </AppLayout>
  )
}

export default PQSEditPage
