import React from 'react'
import { Button } from '#components/button'
import Plus from '#components/icons/Plus'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { AnnualPlanningSubstitutionFormData } from '../libs/annual-planning-substitution-form.type'

type AnnualPlanningSubstitutionFormSubtituteMaterialInfoProps = {
  append: (value: { substitution_material_child: null }) => void
}

const AnnualPlanningSubstitutionFormSubtituteMaterialInfo = ({
  append,
}: AnnualPlanningSubstitutionFormSubtituteMaterialInfoProps) => {
  const { t } = useTranslation(['common', 'annualPlanningSubstitution'])
  const { watch } = useFormContext<AnnualPlanningSubstitutionFormData>()

  return (
    <div className="ui-flex ui-justify-between ui-items-center">
      <h5 className="ui-text-dark-teal ui-font-bold">
        {t('annualPlanningSubstitution:substitute_material')}
      </h5>
      <div className="ui-flex ui-justify-end ui-items-end">
        <Button
          type="button"
          variant="subtle"
          disabled={!watch('material')}
          leftIcon={<Plus />}
          onClick={() => append({ substitution_material_child: null })}
        >
          {t('annualPlanningSubstitution:add_material')}
        </Button>
      </div>
    </div>
  )
}

export default AnnualPlanningSubstitutionFormSubtituteMaterialInfo
