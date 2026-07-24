import React from "react"
import { useTranslation } from "react-i18next"
import { InformationCircleIcon } from '@heroicons/react/24/solid'

import DashboardBox from "#pages/dashboard/components/DashboardBox"

import { numberFormatter } from "#utils/formatter"

type Props = {
  title: string
  setInformation: () => void
  isLoading: boolean
  isEmpty?: boolean
  data: {
    value?: number
    deviation?: number | null
  }
}

const DashboardAnnualCommitmentVsRealizationMetricCard: React.FC<Props> = ({
  title,
  setInformation,
  isLoading,
  isEmpty = true,
  data,
}) => {
  const { i18n: { language } } = useTranslation('dashboardAnnualCommitmentVsRealization')

  return (
    <DashboardBox.Root id="dashboard-annual-commitment-vs-realization-total-annual">
      <DashboardBox.Header bordered size="small">
        <div className="ui-flex ui-justify-center ui-items-center ui-gap-1.5">
          <h4><strong>{title}</strong></h4>

          <button
            type="button"
            onClick={setInformation}
          >
            <InformationCircleIcon className="ui-size-5" />
          </button>
        </div>
      </DashboardBox.Header>
      <DashboardBox.Body>
        <DashboardBox.Content
          className="ui-py-3 ui-text-center"
          isLoading={isLoading}
          isEmpty={isEmpty}
        >
          <div className="ui-space-y-2">
            <p className="ui-text-4xl ui-font-bold ui-text-primary-800">
              {numberFormatter(data?.value, language)}
            </p>

            {data?.deviation ? (
              <p className="ui-text-xs ui-font-bold ui-text-primary-800">
                {data?.deviation > 0 ? '+' : ''}{numberFormatter(data?.deviation, language)}
              </p>
            ) : <br />}
          </div>
        </DashboardBox.Content>
      </DashboardBox.Body>
    </DashboardBox.Root>
  )
}

export default DashboardAnnualCommitmentVsRealizationMetricCard
