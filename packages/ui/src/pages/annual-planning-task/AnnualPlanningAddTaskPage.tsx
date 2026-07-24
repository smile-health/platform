import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import { useTranslation } from 'react-i18next'

import AnnualPlanningTaskFormContainer from './components/AnnualPlanningTaskFormContainer'
import TaskForm from './components/TaskForm'
import { useAnnualPlanningEnabled } from '#hooks/useAnnualPlanningEnabled'
import Container from '#components/layouts/PageContainer'

export default function AnnualPlanningAddTaskPage() {
  usePermission('task-mutate')
  const { isDisabledAnnual } = useAnnualPlanningEnabled()
  if (isDisabledAnnual) return <Container title="" withLayout />

  const { t } = useTranslation(['common', 'task'])

  return (
    <AnnualPlanningTaskFormContainer title={t('task:add')}>
      <Meta title={`SMILE | ${t('task:add')}`} />

      <TaskForm />
    </AnnualPlanningTaskFormContainer>
  )
}
