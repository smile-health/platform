import React from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { StackedBarChart } from '#components/chart'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { ChartOptions, Plugin } from 'chart.js'

import { DataStackedBar } from '../dashboard-annual-commitment-vs-realization.type'

type Props = {
  title: string
  download: {
    targetElementId: string
    fileName: string
  }
  setInformation: () => void
  isLoading: boolean
  isEmpty?: boolean
  data: DataStackedBar
  chartOption: ChartOptions<'bar'>
  chartHeight?: number
  plugins?: Plugin<'bar', any>[]
}

const DashboardAnnualCommitmentVsRealizationChart: React.FC<Props> = ({
  title,
  download,
  setInformation,
  isLoading,
  isEmpty = true,
  data,
  chartOption,
  chartHeight = 150,
  plugins,
}) => {
  return (
    <DashboardBox.Root id={download.targetElementId}>
      <DashboardBox.Header bordered size="small">
        <div className="ui-flex ui-justify-center ui-items-center ui-gap-1.5">
          <h4>
            <strong>{title}</strong>
          </h4>

          <button type="button" onClick={setInformation}>
            <InformationCircleIcon className="ui-size-5" />
          </button>
        </div>
      </DashboardBox.Header>
      <DashboardBox.Body>
        <DashboardBox.Config download={download} />
        <DashboardBox.Content
          className="ui-relative ui-h-72"
          isLoading={isLoading}
          isEmpty={isEmpty}
        >
          <StackedBarChart
            height={chartHeight}
            isStacked
            isShortedNumber={false}
            layout="horizontal"
            data={data.data}
            options={chartOption}
            plugins={plugins}
          />
        </DashboardBox.Content>
      </DashboardBox.Body>
    </DashboardBox.Root>
  )
}

export default DashboardAnnualCommitmentVsRealizationChart
