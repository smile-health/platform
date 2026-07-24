import React from 'react'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import AnnualPlanningSubstitutionForm from './components/AnnualPlanningSubstitutionForm'
import { useAnnualPlanningEnabled } from '#hooks/useAnnualPlanningEnabled'
import Container from '#components/layouts/PageContainer'

const AnnualPlanningSubstitutionCreatePage = () => {
  usePermission('annual-planning-substitution-mutate')
  const { isDisabledAnnual } = useAnnualPlanningEnabled()
  if (isDisabledAnnual) return <Container title="" withLayout />

  const { t } = useTranslation(['common', 'annualPlanningSubstitution'])
  const router = useSmileRouter()
  const { id: planId } = router.query
  return (
    <AppLayout
      title={t('annualPlanningSubstitution:add_substitution')}
      backButton={{
        label: t('common:back'),
        show: true,
        onClick: () => {
          router.push(`/v5/program-plan/${planId}/substitution`)
        },
      }}
    >
      <Meta
        title={`SMILE | ${t('annualPlanningSubstitution:add_substitution')}`}
      />
      <AnnualPlanningSubstitutionForm />
    </AppLayout>
  )
}

export default AnnualPlanningSubstitutionCreatePage
