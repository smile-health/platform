import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { detailAnnualPlanningSubstitution } from '../services/annual-planning-substitution.services'
import AnnualPlanningSubstitutionForm from './components/AnnualPlanningSubstitutionForm'
import { useAnnualPlanningEnabled } from '#hooks/useAnnualPlanningEnabled'

const AnnualPlanningSubstitutionEditPage = () => {
  usePermission('annual-planning-substitution-mutate')
  const { t } = useTranslation(['common', 'annualPlanningSubstitution'])
  const router = useSmileRouter()
  const { isDisabledAnnual } = useAnnualPlanningEnabled()
  if (isDisabledAnnual) return <Container title="" withLayout />

  const {
    query: { id: planId, substitutionId: id },
  } = router

  const {
    data: annualPlanningSubstitutionData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['annual-planning-substitution', planId, id],
    queryFn: () => detailAnnualPlanningSubstitution(Number(planId), Number(id)),
    enabled: !!id && !!planId && router.isReady,
  })

  useSetLoadingPopupStore(isLoading || isFetching)

  if (!annualPlanningSubstitutionData) {
    return null
  }

  return (
    <Container
      title={t('annualPlanningSubstitution:edit_substitution')}
      withLayout
      backButton={{
        show: true,
        onClick: () => {
          router.push(`/v5/program-plan/${planId}/substitution`)
        },
      }}
    >
      <Meta
        title={`SMILE | ${t('annualPlanningSubstitution:edit_substitution')}`}
      />
      <AnnualPlanningSubstitutionForm data={annualPlanningSubstitutionData} />
    </Container>
  )
}

export default AnnualPlanningSubstitutionEditPage
