import React from 'react'
import cx from 'classnames'
import { useTranslation } from 'react-i18next'

type AnnualPlanningTargetGroupStatusCapsuleProps = {
  isActive: boolean
}
const AnnualPlanningTargetGroupStatusCapsule = ({
  isActive,
}: AnnualPlanningTargetGroupStatusCapsuleProps) => {
  const { t } = useTranslation(['annualPlanningTargetGroup'])
  const statusClass = cx('ui-px-4 ui-py-2 ui-rounded-full ui-w-fit', {
    'ui-text-green-700 bg-green-100': isActive,
    'ui-text-red-700 bg-red-100': !isActive,
  })
  return (
    <div className={statusClass}>
      {isActive
        ? t('annualPlanningTargetGroup:table.active')
        : t('annualPlanningTargetGroup:table.inactive')}
    </div>
  )
}

export default AnnualPlanningTargetGroupStatusCapsule
