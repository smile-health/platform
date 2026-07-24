import React from 'react'
import cx from 'classnames'
import { useTranslation } from 'react-i18next'

type ProgramPlanStatusCapsuleProps = {
  isFinale: boolean
}
const ProgramPlanStatusCapsule = ({
  isFinale,
}: ProgramPlanStatusCapsuleProps) => {
  const { t } = useTranslation(['programPlan'])
  const statusClass = cx(
    'ui-px-4 ui-py-2 ui-rounded-full ui-w-fit ui-font-semibold',
    {
      'ui-text-green-700 ui-bg-green-100': isFinale,
      'ui-text-cyan-950 ui-bg-stone-100': !isFinale,
    }
  )
  return (
    <div className={statusClass}>
      {isFinale ? t('programPlan:status.final') : t('programPlan:status.draft')}
    </div>
  )
}

export default ProgramPlanStatusCapsule
