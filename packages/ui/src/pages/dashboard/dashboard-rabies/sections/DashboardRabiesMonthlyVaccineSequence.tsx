import { useState } from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { useTranslation } from 'react-i18next'

import DashboardRabiesMonthlyVaccineSequenceChart from '../components/DashboardRabiesMonthlyVaccineSequenceChart'
import DashboardRabiesRadioFilter from '../components/DashboardRabiesRadioFilter'
import { handleFilter } from '../dashboard-rabies.helper'
import { TDashboardRabiesFilter, TInformation } from '../dashboard-rabies.type'

type Props = Readonly<{
  enabled?: boolean
  filter: TDashboardRabiesFilter
  setInformation: (information: TInformation) => void
}>

export default function DashboardRabiesMonthlyVaccineSequence({
  filter,
  enabled = false,
  setInformation,
}: Props) {
  const { t } = useTranslation('dashboardRabies')

  const [method, setMethod] = useState<string>('0')
  const [gender, setGender] = useState<string>('0')

  const params = handleFilter({
    ...filter,
    vaccine_method: method,
    gender,
  })

  return (
    <DashboardBox.Root id="dashboard-rabies-monthly-vaccine-sequence">
      <DashboardBox.Header bordered size="small">
        <div className="ui-flex ui-justify-center ui-items-center ui-gap-1.5">
          <h4>
            <strong>{t('title.vaccine_sequence')}</strong>
          </h4>

          <button
            onClick={() =>
              setInformation({
                title: t('title.vaccine_sequence'),
                description: t('description.vaccine_sequence'),
              })
            }
          >
            <InformationCircleIcon className="ui-size-5" />
          </button>
        </div>
      </DashboardBox.Header>
      <div className="ui-relative ui-p-4 ui-bg-gray-50 ui-border-b ui-border-gray-50 ui-space-y-4">
        <DashboardRabiesRadioFilter
          activeMethod={method}
          activeGender={gender}
          onChangeMethod={setMethod}
          onChangeGender={setGender}
        />
      </div>
      <div className="ui-relative ui-bg-white ui-space-y-4">
        <DashboardBox.Body>
          <div className="ui-absolute ui-right-2 -ui-top-2 ui-mb-4">
            <DashboardBox.Config
              download={{
                targetElementId: 'dashboard-rabies-monthly-vaccine-sequence',
                fileName: `Dashboard Rabies - ${t('title.vaccine_sequence')}`,
              }}
            />
          </div>
          <DashboardRabiesMonthlyVaccineSequenceChart
            params={params}
            enabled={enabled}
          />
        </DashboardBox.Body>
      </div>
    </DashboardBox.Root>
  )
}
