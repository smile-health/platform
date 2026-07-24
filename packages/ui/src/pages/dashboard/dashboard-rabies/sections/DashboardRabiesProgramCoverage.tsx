import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { useQuery } from '@tanstack/react-query'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { numberFormatter } from '#utils/formatter'
import { Trans, useTranslation } from 'react-i18next'

import { handleFilter } from '../dashboard-rabies.helper'
import { getProgramCoverage } from '../dashboard-rabies.service'
import { TDashboardRabiesFilter, TInformation } from '../dashboard-rabies.type'

type Props = Readonly<{
  enabled?: boolean
  filter: TDashboardRabiesFilter
  setInformation: (information: TInformation) => void
}>

export default function DashboardRabiesProgramCoverage({
  filter,
  enabled = false,
  setInformation,
}: Props) {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardRabies')

  const params = handleFilter(filter)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['rabies-program-coverage', params],
    queryFn: () => getProgramCoverage(params),
    enabled: enabled,
  })

  const formatNumber = (value?: number) => {
    if (!enabled) return '-'
    return numberFormatter(value ?? 0, language)
  }

  return (
    <DashboardBox.Root id="dashboard-rabies-program-coverage">
      <DashboardBox.Header bordered size="small">
        <div className="ui-flex ui-justify-center ui-items-center ui-gap-1.5">
          <h4>
            <strong>{t('title.program_coverage')}</strong>
          </h4>

          <button
            onClick={() =>
              setInformation({
                title: t('title.program_coverage'),
                description: t('description.program_coverage'),
              })
            }
          >
            <InformationCircleIcon className="ui-size-5" />
          </button>
        </div>
      </DashboardBox.Header>
      <DashboardBox.Body>
        <DashboardBox.Content
          className="ui-py-3 ui-space-y-5"
          isLoading={isLoading || isFetching}
        >
          <div className="ui-grid ui-grid-cols-4 ui-divide-x ui-divide-slate-200 ui-text-center">
            <div className="ui-py-2 ui-space-y-1">
              <p className="ui-text-4xl ui-font-semibold ui-text-slate-800">
                {formatNumber(data?.data?.total_province)}
              </p>
              <p className="ui-text-sm ui-text-dark-teal ui-font-bold">
                {t('label.total_province')}
              </p>
            </div>

            <div className="ui-py-2 ui-space-y-1">
              <p className="ui-text-4xl ui-font-semibold ui-text-slate-800">
                {formatNumber(data?.data?.total_regency)}
              </p>
              <p className="ui-text-sm ui-text-dark-teal ui-font-bold">
                {t('label.regency')}
              </p>
            </div>

            <div className="ui-py-2 ui-space-y-1">
              <p className="ui-text-4xl ui-font-semibold ui-text-slate-800">
                {formatNumber(data?.data?.total_faskes)}
              </p>
              <p className="ui-text-sm ui-text-dark-teal ui-font-bold">
                <Trans
                  t={t}
                  i18nKey="label.phc"
                  values={{
                    total: formatNumber(data?.data?.total_faskes_denom),
                  }}
                  components={{ span: <span className="ui-font-semibold" /> }}
                />
              </p>
            </div>

            <div className="ui-py-2 ui-space-y-1">
              <p className="ui-text-4xl ui-font-semibold ui-text-slate-800">
                {formatNumber(data?.data?.total_hospital)}
              </p>
              <p className="ui-text-sm ui-text-dark-teal ui-font-bold">
                <Trans
                  t={t}
                  i18nKey="label.hospital"
                  values={{
                    total: formatNumber(data?.data?.total_hospital_denom),
                  }}
                  components={{ span: <span className="ui-font-semibold" /> }}
                />
              </p>
            </div>
          </div>
        </DashboardBox.Content>
      </DashboardBox.Body>
    </DashboardBox.Root>
  )
}
