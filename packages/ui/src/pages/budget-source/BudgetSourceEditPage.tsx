'use client'

import { FC } from 'react'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { CommonType } from '#types/common'

import BudgetSourceForm from './components/BudgetSourceForm'
import BudgetSourceSkeleton from './components/BudgetSourceSkeleton'
import { useBudgetSourceDetail } from './hooks/useBudgetSourceDetail'

const BudgetSourceEditPage: FC<CommonType> = ({ isGlobal }): JSX.Element => {
  usePermission('budget-source-global-mutate')
  const { data, isLoading, defaultValue, t } = useBudgetSourceDetail({
    isGlobal,
  })
  const program_ids = data?.programs?.map((item) => item.id)
  useSetLoadingPopupStore(isLoading)

  return (
    <AppLayout title={t('budgetSource:detail.title')}>
      <Meta
        title={`Smile | ${isGlobal ? 'Global' : ''} ${t('budgetSource:form.title.edit')}`}
      />
      <div className="ui-space-y-6">
        {isLoading ? (
          <BudgetSourceSkeleton />
        ) : (
          <BudgetSourceForm
            defaultValues={defaultValue}
            isGlobal={isGlobal}
            disabledProgramIds={program_ids}
          />
        )}
      </div>
    </AppLayout>
  )
}

export default BudgetSourceEditPage
