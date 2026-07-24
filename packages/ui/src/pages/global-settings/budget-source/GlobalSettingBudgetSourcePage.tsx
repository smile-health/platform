'use client'

import { useRouter } from 'next/navigation'
import BudgetSourceListPage from '#pages/budget-source/BudgetSourceListPage'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import GlobalSettings from '../GlobalSettings'

const GlobalSettingBudgetSourcePage = () => {
  const router = useRouter()
  const {
    i18n: { language, t },
  } = useTranslation(['budgetSource'])
  return (
    <GlobalSettings
      title={t('budgetSource:list.list')}
      showButtonCreate={hasPermission('budget-source-global-mutate')}
      buttonCreate={{
        label: t('budgetSource:list.add'),
        onClick: () =>
          router.push(`/${language}/v5/global-settings/budget-source/create`),
      }}
    >
      <BudgetSourceListPage isGlobal />
    </GlobalSettings>
  )
}

export default GlobalSettingBudgetSourcePage
