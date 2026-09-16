import React from 'react'
import { Checkbox } from '#components/checkbox'
import cx from '#lib/cx'
import { ActivityData } from '#types/activity'

import { ActivityItem } from './ActivityItem'

type ActivityItemWrapperProps = {
  activity: ActivityData
  isChecked: boolean
  onSelectActivity: (id: number) => void
}

const ActivityItemWrapper: React.FC<ActivityItemWrapperProps> = ({
  activity,
  isChecked,
  onSelectActivity,
}) => {
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
    </button>
  )
}

export default ActivityItemWrapper
