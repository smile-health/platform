import { FormControl, FormLabel } from '#components/form-control'
import { Radio, RadioGroup } from '#components/radio'
import { useTranslation } from 'react-i18next'

import { useDashboardColdStorageCapacity } from '../../DashboardColdStorageCapacityContext'

export default function ColdStorageDetailFilter() {
  const { t } = useTranslation('dashboardColdStorageCapacity')
  const { detail } = useDashboardColdStorageCapacity()

  return (
    <div className="ui-flex ui-gap-4 ui-bg-white ui-p-4 ui-rounded ui-border ui-w-full">
      <FormControl className="ui-justify-between ui-flex ui-items-center ui-space-y-0 ui-w-full">
        <FormLabel>{t('section.details.certification_status.label')}</FormLabel>
        <RadioGroup className="ui-flex ui-items-center ui-justify-center">
          <Radio
            label={t('section.details.certification_status.who_pqs')}
            value="1"
            checked={detail.isPqs}
            onChange={() => detail.onChangePqs(true)}
          />
          <Radio
            label={t('section.details.certification_status.non_who_pqs')}
            value="0"
            checked={!detail.isPqs}
            onChange={() => detail.onChangePqs(false)}
          />
        </RadioGroup>
      </FormControl>
    </div>
  )
}
