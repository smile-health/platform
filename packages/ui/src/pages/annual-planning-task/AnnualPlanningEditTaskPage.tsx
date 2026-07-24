import Meta from '#components/layouts/Meta'
import { useTranslation } from 'react-i18next'

import AnnualPlanningTaskFormContainer from './components/AnnualPlanningTaskFormContainer'
import TaskForm from './components/TaskForm'
import { useAnnualPlanningEnabled } from '#hooks/useAnnualPlanningEnabled'
import Container from '#components/layouts/PageContainer'

export default function AnnualPlanningEditTaskPage() {
  const { t } = useTranslation(['common', 'task'])
  const { isDisabledAnnual } = useAnnualPlanningEnabled()
  if (isDisabledAnnual) return <Container title="" withLayout />

  return (
    <AnnualPlanningTaskFormContainer title={t('task:edit.title')}>
      <Meta title={`SMILE | ${t('task:edit.title')}`} />

      <TaskForm isEdit />
    </AnnualPlanningTaskFormContainer>
  )
}
