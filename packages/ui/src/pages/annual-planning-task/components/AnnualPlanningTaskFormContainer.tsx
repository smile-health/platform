import { ReactNode } from 'react'
import Container from '#components/layouts/PageContainer'
import { useTranslation } from 'react-i18next'

import useValidationFinalTask from '../hooks/useValidationFinalTask'

type Props = {
  children: ReactNode
  title: string
}

export default function AnnualPlanningTaskFormContainer({
  children,
  title,
}: Readonly<Props>) {
  const { detailProgramPlanData } = useValidationFinalTask()
  const { t } = useTranslation(['common', 'programPlan'])

  if (!detailProgramPlanData || detailProgramPlanData.is_final) return null

  return (
    <Container title={title} withLayout>
      <div className="ui-py-4 ui-px-6 ui-border ui-border-gray-300 ui-rounded ui-flex ui-justify-between ui-items-start ui-max-w-2xl ui-mx-auto">
        <div className="ui-flex ui-flex-col ui-gap-2">
          <div className="ui-table">
            <div className="ui-table-row">
              <div className="ui-table-cell ui-py-1 ui-pr-4 ui-text-neutral-500 ui-w-96">
                {t('programPlan:table.year_plan')}
              </div>
              <div className="ui-table-cell ui-py-1 ui-text-dark-teal">
                : {detailProgramPlanData?.year}
              </div>
            </div>
            <div className="ui-table-row">
              <div className="ui-table-cell ui-py-1 ui-pr-4 ui-text-neutral-500 ui-w-96">
                {t('programPlan:table.approach')}
              </div>
              <div className="ui-table-cell ui-py-1 ui-text-dark-teal">
                : {detailProgramPlanData?.approach?.name}
              </div>
            </div>
          </div>
        </div>
      </div>
      {children}
    </Container>
  )
}
