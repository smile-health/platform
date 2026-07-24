import React from 'react'
import cx from 'classnames'
import { useTranslation } from 'react-i18next'

type BmhpPlanningStatusCapsuleProps = {
  isFinal?: boolean
}

const BmhpPlanningStatusCapsule = ({
  isFinal = false,
}: BmhpPlanningStatusCapsuleProps) => {
  const { t } = useTranslation(['bmhpPlanning'])

  const statusClass = cx(
    'ui-px-4 ui-py-2 ui-rounded-full ui-w-fit ui-font-semibold',
    {
      'ui-text-green-700 ui-bg-green-100': isFinal,
      'ui-text-gray-700 ui-bg-gray-100': !isFinal,
    }
  )

  return (
    <div className={statusClass}>
      {isFinal ? t('bmhpPlanning:status.final') : t('bmhpPlanning:status.draft')}
    </div>
  )
}

export default BmhpPlanningStatusCapsule
