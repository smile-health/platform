import React, { useContext } from 'react'
import { Button } from '#components/button'
import Plus from '#components/icons/Plus'
import { useTranslation } from 'react-i18next'

import BmhpPlanningDetailContext from '../../../bmhp-planning/list/libs/bmhp-planning-list.context'

type BmhpTargetGroupPlanInfoProps = {
  append: (value: { target_group_child: null }) => void
}

const BmhpTargetGroupPlanInfo = ({ append }: BmhpTargetGroupPlanInfoProps) => {
  const { t } = useTranslation([
    'common',
    'annualPlanningTargetGroup',
    'masterBmhp',
  ])
  const { yearData } = useContext(BmhpPlanningDetailContext)

  return (
    <div className="ui-flex ui-justify-between ui-items-center">
      <div className="ui-flex ui-justify-start ui-items-start ui-gap-14">
        <div className="ui-flex ui-flex-col">
          <h4 className="ui-text-neutral-500">
            {t('annualPlanningTargetGroup:table.year')}:
          </h4>
          <h5 className="ui-text-dark-teal ui-font-bold">{yearData?.year}</h5>
        </div>
      </div>
      <div className="ui-flex ui-justify-end ui-items-end">
        <Button
          type="button"
          variant="subtle"
          leftIcon={<Plus />}
          onClick={() => append({ target_group_child: null })}
        >
          {t('annualPlanningTargetGroup:add_target_group')}
        </Button>
      </div>
    </div>
  )
}

export default BmhpTargetGroupPlanInfo
