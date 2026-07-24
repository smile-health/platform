import React from 'react'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import { useTranslation } from 'react-i18next'

import ProgramPlanForm from './components/ProgramPlanForm'

const ProgramPlanCreatePage = () => {
  usePermission('program-plan-mutate')
  const { t } = useTranslation(['common', 'programPlan'])
  return (
    <Container title={t('programPlan:add_program_plan')} withLayout>
      <Meta title={`SMILE | ${t('programPlan:add_program_plan')}`} />
      <ProgramPlanForm />
    </Container>
  )
}

export default ProgramPlanCreatePage
