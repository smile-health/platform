import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { useQuery } from '@tanstack/react-query'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import { handleFilter } from '../dashboard-rabies.helper'
import { getRecipientVaccine } from '../dashboard-rabies.service'
import { TDashboardRabiesFilter, TInformation } from '../dashboard-rabies.type'

type Props = Readonly<{
  enabled?: boolean
  filter: TDashboardRabiesFilter
  setInformation: (information: TInformation) => void
}>

export default function DashboardRabiesRecipientVaccine({
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
    queryKey: ['rabies-recipient-vaccine', params],
    queryFn: () => getRecipientVaccine(params),
    enabled: enabled,
  })

  const formatNumber = (value?: number) => {
    if (!enabled) return '-'
    return numberFormatter(value ?? 0, language)
  }

  return (
    <DashboardBox.Root id="dashboard-rabies-recipient-vaccine">
      <DashboardBox.Header bordered size="small">
        <div className="ui-flex ui-justify-center ui-items-center ui-gap-1.5">
          <h4>
            <strong>{t('title.rabies_vaccination')}</strong>
          </h4>

          <button
            onClick={() =>
              setInformation({
                title: t('title.rabies_vaccination'),
                description: t('description.rabies_vaccination'),
                contentClassName: 'ui-space-y-0',
                listType: 'list',
                details: [
                  t('label.total_var_sar_case'),
                  t('label.total_var_case'),
                  t('label.total_var_dose'),
                  t('label.total_sar_case'),
                  t('label.total_sar_dose'),
                ],
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
          <div className="ui-grid ui-grid-cols-5 ui-divide-x ui-divide-slate-200 ui-text-center">
            <div className="ui-py-2 ui-space-y-1">
              <p className="ui-text-4xl ui-font-semibold ui-text-slate-800">
                {formatNumber(data?.data?.total_patient)}
              </p>
              <p className="ui-text-sm ui-text-dark-teal ui-font-bold">
                {t('label.total_var_sar_case')}
              </p>
            </div>

            <div className="ui-py-2 ui-space-y-1">
              <p className="ui-text-4xl ui-font-semibold ui-text-slate-800">
                {formatNumber(data?.data?.total_patient_vaccine)}
              </p>
              <p className="ui-text-sm ui-text-dark-teal ui-font-bold">
                {t('label.total_var_case')}
              </p>
            </div>

            <div className="ui-py-2 ui-space-y-1">
              <p className="ui-text-4xl ui-font-semibold ui-text-slate-800">
                {formatNumber(data?.data?.total_dose_vaccine)}
              </p>
              <p className="ui-text-sm ui-text-dark-teal ui-font-bold">
                {t('label.total_var_dose')}
              </p>
            </div>

            <div className="ui-py-2 ui-space-y-1">
              <p className="ui-text-4xl ui-font-semibold ui-text-slate-800">
                {formatNumber(data?.data?.total_patient_sar)}
              </p>
              <p className="ui-text-sm ui-text-dark-teal ui-font-bold">
                {t('label.total_sar_case')}
              </p>
            </div>

            <div className="ui-py-2 ui-space-y-1">
              <p className="ui-text-4xl ui-font-semibold ui-text-slate-800">
                {formatNumber(data?.data?.total_dose_sar)}
              </p>
              <p className="ui-text-sm ui-text-dark-teal ui-font-bold">
                {t('label.total_sar_dose')}
              </p>
            </div>
          </div>
        </DashboardBox.Content>
      </DashboardBox.Body>
    </DashboardBox.Root>
  )
}
