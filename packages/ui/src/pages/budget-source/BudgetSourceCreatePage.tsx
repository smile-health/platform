import React from 'react'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { CommonType } from '#types/common'
import { useTranslation } from 'react-i18next'

import BudgetSourceForm from './components/BudgetSourceForm'
import { usePermission } from '#hooks/usePermission'

const BudgetSourceCreatePage: React.FC<CommonType> = ({ isGlobal }) => {
  usePermission('budget-source-global-mutate')
  const { t } = useTranslation(['budgetSource', 'common'])

  return (
    <Container
      withLayout
      title={
        isGlobal
          ? t('budgetSource:form.title.add')
          : t('budgetSource:list.list')
      }
      hideTabs={isGlobal}
    >
      <Meta
        title={`Smile | ${isGlobal ? 'Global' : ''} ${t('budgetSource:form.title.add')}`}
      />
      <BudgetSourceForm isGlobal={isGlobal} />
    </Container>
  )
}

export default BudgetSourceCreatePage
