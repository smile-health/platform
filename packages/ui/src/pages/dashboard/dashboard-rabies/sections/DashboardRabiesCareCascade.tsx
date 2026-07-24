import { useState } from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '#components/tabs'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { useTranslation } from 'react-i18next'

import DashboardRabiesCareCascadeChart from '../components/DashboardRabiesCareCascadeChart'
import DashboardRabiesRadioFilter from '../components/DashboardRabiesRadioFilter'
import { getCareCascadeTabs } from '../dashboard-rabies.constant'
import { handleFilter } from '../dashboard-rabies.helper'
import { TDashboardRabiesFilter, TInformation } from '../dashboard-rabies.type'

type Props = Readonly<{
  enabled?: boolean
  filter: TDashboardRabiesFilter
  setInformation: (information: TInformation) => void
}>

export default function DashboardRabiesCareCascade({
  filter,
  enabled = false,
  setInformation,
}: Props) {
  const { t } = useTranslation('dashboardRabies')

  const [method, setMethod] = useState<string>('0')
  const [gender, setGender] = useState<string>('0')

  const tabs = getCareCascadeTabs(t)

  return (
    <DashboardBox.Root id="dashboard-rabies-care-cascade">
      <DashboardBox.Header bordered size="small">
        <div className="ui-flex ui-justify-center ui-items-center ui-gap-1.5">
          <h4>
            <strong>{t('title.care_cascade')}</strong>
          </h4>

          <button
            onClick={() =>
              setInformation({
                title: t('title.care_cascade'),
                details: t('details.care_cascade', {
                  returnObjects: true,
                }),
              })
            }
          >
            <InformationCircleIcon className="ui-size-5" />
          </button>
        </div>
      </DashboardBox.Header>
      <div className="ui-relative ui-bg-gray-50 ui-rounded-b-[inherit] ui-space-y-4">
        <div className="ui-px-4 ui-pt-4 ui-w-full">
          <DashboardRabiesRadioFilter
            activeMethod={method}
            activeGender={gender}
            onChangeMethod={setMethod}
            onChangeGender={setGender}
          />
        </div>
        <div className="ui-p-4 ui-w-full ui-bg-white">
          <DashboardBox.Body>
            <div className="ui-absolute ui-right-2 -ui-top-2 ui-mb-4">
              <DashboardBox.Config
                download={{
                  targetElementId: 'dashboard-rabies-care-cascade',
                  fileName: `Dashboard Rabies - ${t('title.care_cascade')}`,
                }}
              />
            </div>
            <TabsRoot variant="pills" defaultValue="all" align="stretch">
              <TabsList className="ui-grid-cols-3 ui-grow ui-my-2">
                {tabs?.map((item) => (
                  <TabsTrigger
                    key={item?.key}
                    value={item?.key}
                    className="ui-justify-center ui-text-sm ui-px-2 ui-h-10"
                  >
                    {item?.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {tabs?.map((item) => {
                const params = handleFilter({
                  ...filter,
                  vaccine_method: method,
                  gender,
                  identity_type: item?.value,
                })

                return (
                  <TabsContent key={item?.key} value={item?.key}>
                    <DashboardRabiesCareCascadeChart
                      params={params}
                      enabled={enabled}
                    />
                  </TabsContent>
                )
              })}
            </TabsRoot>
          </DashboardBox.Body>
        </div>
      </div>
    </DashboardBox.Root>
  )
}
