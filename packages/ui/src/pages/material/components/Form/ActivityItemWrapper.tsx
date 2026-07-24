import React from 'react'
import { Checkbox } from '#components/checkbox'
import { Switch } from '#components/switch'
import cx from '#lib/cx'
import { ActivityData } from '#types/activity'
import { useTranslation } from 'react-i18next'

import { ActivityItem } from './ActivityItem'

type ActivityItemWrapperProps = {
  activity: ActivityData
  isChecked: boolean
  isPatientNeeded: boolean
  onChangePatientNeeded: (id: number) => void
  onSelectActivity: (id: number) => void
  showMaterialActivityPatient?: boolean
}

const ActivityItemWrapper: React.FC<ActivityItemWrapperProps> = ({
  activity,
  isChecked,
  isPatientNeeded,
  onChangePatientNeeded,
  onSelectActivity,
  showMaterialActivityPatient,
}) => {
  const { t } = useTranslation(['common', 'material'])

  const handleClick = () => {
    if (!activity) return

    onSelectActivity(activity.id)
  }

  return (
    <button
      key={activity?.id}
      onClick={handleClick}
      type="button"
      className={cx(
        'ui-flex ui-gap-4 ui-border ui-rounded-lg ui-p-4 ui-items-center',
        {
          'ui-bg-[#E2F3FC] ui-border-[#004990]': isChecked,
          'ui-border-gray-300': !isChecked,
        }
      )}
    >
      <Checkbox id={`cbx-program-${activity.id}`} checked={isChecked} />
      <ActivityItem
        id={activity.id}
        activity={activity}
        className={{
          wrapper: 'ui-gap-4 ui-flex-auto',
          title: 'ui-text-base',
        }}
      />
      {showMaterialActivityPatient && isChecked && (
        <div className="ui-flex ui-gap-2 ui-items-center">
          <p className="ui-text-sm">
            {t('material:form.activity.requires_patient_data')}?
          </p>
          <Switch
            onHandleClick={(e) => e.stopPropagation()}
            onCheckedChange={() => onChangePatientNeeded(activity.id)}
            checked={isPatientNeeded}
            labelInside={{
              on: t('yes'),
              off: t('no'),
            }}
          />
        </div>
      )}
    </button>
  )
}

export default ActivityItemWrapper
