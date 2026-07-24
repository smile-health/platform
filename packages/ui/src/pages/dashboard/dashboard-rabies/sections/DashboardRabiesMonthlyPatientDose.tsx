import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '#components/tabs'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { useTranslation } from 'react-i18next'

import DashboardRabiesMonthlyPatientDoseChart from '../components/DashboardRabiesMonthlyPatientDoseChart'
import { MONTHLY_PATIENT_DOSE_TABS } from '../dashboard-rabies.constant'
import { handleFilter } from '../dashboard-rabies.helper'
import { TDashboardRabiesFilter, TInformation } from '../dashboard-rabies.type'

type Props = Readonly<{
  enabled?: boolean
  filter: TDashboardRabiesFilter
  setInformation: (information: TInformation) => void
}>

export default function DashboardRabieMonthlyPatientDose({
  filter,
  enabled = false,
  setInformation,
}: Props) {
  const { t } = useTranslation('dashboardRabies')

  const tabs = MONTHLY_PATIENT_DOSE_TABS(t)

  return (
    <DashboardBox.Root id="dashboard-rabies-monthly-patient-dose">
      <DashboardBox.Header bordered size="small">
        <div className="ui-flex ui-justify-center ui-items-center ui-gap-1.5">
          <h4>
            <strong>{t('title.patient_dose')}</strong>
          </h4>

          <button
            onClick={() =>
              setInformation({
                title: t('title.patient_dose'),
                description: t('description.patient_dose'),
              })
            }
          >
            <InformationCircleIcon className="ui-size-5" />
          </button>
        </div>
      </DashboardBox.Header>
      <div className="ui-relative ui-bg-gray-50 ui-rounded-b-[inherit] ui-space-y-4">
        <DashboardBox.Body>
          <div className="ui-absolute ui-right-2 -ui-top-2 ui-mb-4">
            <DashboardBox.Config
              download={{
                targetElementId: 'dashboard-rabies-monthly-patient-dose',
                fileName: `Dashboard Rabies - ${t('title.patient_dose')}`,
              }}
            />
          </div>
          <TabsRoot variant="pills" defaultValue="var" align="stretch">
            <TabsList className="ui-grid-cols-2 ui-grow ui-mb-2">
              {tabs?.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="ui-justify-center ui-text-sm ui-px-2 ui-h-10"
                >
                  {item?.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs?.map((item) => {
              const params = handleFilter({
                ...filter,
                vaccine: item.value,
              })
              return (
                <TabsContent key={item.value} value={item.value}>
                  <DashboardRabiesMonthlyPatientDoseChart
                    params={params}
                    enabled={enabled}
                  />
                </TabsContent>
              )
            })}
          </TabsRoot>
        </DashboardBox.Body>
      </div>
    </DashboardBox.Root>
  )
}
