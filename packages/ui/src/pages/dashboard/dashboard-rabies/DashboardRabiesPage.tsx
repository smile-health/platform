import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useFilter } from '#components/filter'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import DashboardBox from '../components/DashboardBox'
import DashboardFilter from '../components/DashboardFilter'
import DashboardInformation from '../components/DashboardInformation'
import { handleFilter } from '../dashboard.helper'
import { exportDashboardRabies } from './dashboard-rabies.service'
import { TInformation } from './dashboard-rabies.type'
import { useDashboardRabiesEnabled } from './hooks/useDashboardRabiesEnabled'
import dashboardRabiesFilterSchema from './schemas/dashboardRabiesFilterSchema'
import DashboardRabiesCareCascade from './sections/DashboardRabiesCareCascade'
import DashboardRabiesEntity from './sections/DashboardRabiesEntity'
import DashboardRabiesLocation from './sections/DashboardRabiesLocation'
import DashboardRabieMonthlyPatientDose from './sections/DashboardRabiesMonthlyPatientDose'
import DashboardRabiesMonthlyVaccineSequence from './sections/DashboardRabiesMonthlyVaccineSequence'
import DashboardRabiesProgramCoverage from './sections/DashboardRabiesProgramCoverage'
import DashboardRabiesRecipientVaccine from './sections/DashboardRabiesRecipientVaccine'

export default function DashboardRabiesPage() {
  usePermission('dashboard-rabies-view')
  const { isRabiesWorkspace } = useDashboardRabiesEnabled()
  const [enabled, setEnabled] = useState(false)
  const [information, setInformation] = useState<TInformation>({
    title: '',
    description: '',
    details: [],
  })

  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardRabies')

  const schema = useMemo(
    () => dashboardRabiesFilterSchema(t, language),
    [t, language]
  )

  const filter = useFilter(schema)

  const onResetInformation = (open: boolean) => {
    if (!open) {
      setInformation({
        title: '',
        description: '',
        details: [],
      })
    }
  }

  const params = handleFilter(filter?.query)

  const { isLoading, isFetching, refetch } = useQuery({
    queryKey: ['export-dashboard-rabies', params],
    queryFn: () => exportDashboardRabies(params),
    enabled: false,
  })

  useSetLoadingPopupStore(isLoading || isFetching)

  if (!isRabiesWorkspace) return null

  return (
    <Container title={t('title.page')} withLayout>
      <Meta title={generateMetaTitle(t('title.page'))} />
      <DashboardInformation
        open={Boolean(information?.title)}
        setOpen={onResetInformation}
        {...information}
      />
      <DashboardBox.Provider
        filter={filter?.query}
        colorClass="ui-bg-gray-100"
        showRegion={false}
      >
        <div className="ui-space-y-6">
          <DashboardFilter
            filter={filter}
            grid={4}
            onExport={() => refetch()}
            onSubmit={() => {
              setTimeout(() => {
                if (!enabled) setEnabled(true)
              }, 150)
            }}
          />

          <DashboardRabiesProgramCoverage
            enabled={enabled}
            filter={filter?.query}
            setInformation={setInformation}
          />

          <DashboardRabiesRecipientVaccine
            enabled={enabled}
            filter={filter?.query}
            setInformation={setInformation}
          />

          <DashboardRabiesCareCascade
            enabled={enabled}
            filter={filter?.query}
            setInformation={setInformation}
          />

          <DashboardRabieMonthlyPatientDose
            enabled={enabled}
            filter={filter?.query}
            setInformation={setInformation}
          />

          <DashboardRabiesMonthlyVaccineSequence
            enabled={enabled}
            filter={filter?.query}
            setInformation={setInformation}
          />

          <DashboardRabiesLocation
            enabled={enabled}
            filter={filter?.query}
            setInformation={setInformation}
          />

          <DashboardRabiesEntity
            enabled={enabled}
            filter={filter?.query}
            setInformation={setInformation}
          />
        </div>
      </DashboardBox.Provider>
    </Container>
  )
}
