'use client'

import { FC } from 'react'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { CommonType } from '#types/common'

import BudgetSourceDetailInfo from './components/BudgetSourceDetailInfo'
import BudgetSourceDetailWorkspace from './components/BudgetSourceDetailWorkspace'
import { useBudgetSourceDetail } from './hooks/useBudgetSourceDetail'

const BudgetSourceDetailPage: FC<CommonType> = ({ isGlobal }): JSX.Element => {
  usePermission(isGlobal ? 'budget-source-global-view' : 'budget-source-view')
  const { data, isLoading, onUpdateStatus, isUpdateStatus, t } =
    useBudgetSourceDetail({ isGlobal })
  useSetLoadingPopupStore(isLoading)
  return (
    <AppLayout title={t('budgetSource:detail.title')}>
      <Meta
        title={`Smile | ${isGlobal ? 'Global' : ''} ${t('budgetSource:detail.title')}`}
      />
      <div className="ui-space-y-6">
        <BudgetSourceDetailInfo
          data={data}
          isGlobal={isGlobal}
          isLoading={isLoading}
          onUpdateStatus={onUpdateStatus}
          isLoadingUpdateStatus={isUpdateStatus}
        />
        {isGlobal && (
          <BudgetSourceDetailWorkspace
            data={data}
            isLoading={isLoading}
            t={t}
          />
        )}
      </div>
    </AppLayout>
  )
}

export default BudgetSourceDetailPage
