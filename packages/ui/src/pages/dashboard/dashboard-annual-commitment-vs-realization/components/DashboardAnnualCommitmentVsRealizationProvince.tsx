import React from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { StackedBarChart } from '#components/chart'
import { DataTable } from '#components/data-table'
import cx from '#lib/cx'
import DashboardAnnualContainer from '#pages/dashboard/components/DashboardAnnualContainer'
import DashboardBox from '#pages/dashboard/components/DashboardBox'

import { AnnualCommitmentVsRealizationProvinceData } from '../dashboard-annual-commitment-vs-realization.type'
import { useDashboardAnnualCommitmentVsRealizationProvince } from '../hooks/useDashboardAnnualCommitmentVsRealizationProvince'
import DashboardAnnualCommitmentVsRealizationFilterProvince from './DashboardAnnualCommitmentVsRealizationFilterProvince'

type Props = {
  setInformation: () => void
  isLoading: boolean
  data: {
    data: AnnualCommitmentVsRealizationProvinceData[]
    title?: string
  }
}

const DashboardAnnualCommitmentVsRealizationProvince: React.FC<Props> = ({
  setInformation,
  isLoading,
  data,
}) => {
  const {
    t,
    chartOption,
    columns,
    downloadConfig,
    province,
    chartData,
    dataTable,
    setProvince,
  } = useDashboardAnnualCommitmentVsRealizationProvince({ data: data.data })

  return (
    <DashboardBox.Root id={downloadConfig.province.targetElementId}>
      <DashboardBox.Header bordered size="small">
        <div className="ui-flex ui-justify-center ui-items-center ui-gap-1.5">
          <h4>
            <strong>
              {data.title ??
                t('box_title.annual_commitment_vs_realization_province')}
            </strong>
          </h4>

          <button type="button" onClick={setInformation}>
            <InformationCircleIcon className="ui-size-5" />
          </button>
        </div>
      </DashboardBox.Header>
      <DashboardAnnualContainer
        component={
          <DashboardAnnualCommitmentVsRealizationFilterProvince
            province={province}
            setProvince={setProvince}
          />
        }
      >
        {(view) => (
          <DashboardBox.Body>
            <DashboardBox.Content
              className={cx('ui-relative ui-h-[840px]', {
                'ui-h-[680px]': view === 'table',
              })}
              isLoading={isLoading}
              isEmpty={chartData.datasets.length === 0}
            >
              <DashboardBox.Config download={downloadConfig.province} />

              <br />

              {view === 'chart' && (
                <StackedBarChart
                  enableScroll
                  maxHeight={680}
                  isStacked
                  isShortedNumber={false}
                  layout="horizontal"
                  data={chartData}
                  options={chartOption}
                />
              )}

              {view === 'table' && (
                <DataTable
                  data={dataTable}
                  isLoading={isLoading}
                  columns={columns}
                  className="ui-max-h-[560px]"
                />
              )}
            </DashboardBox.Content>
          </DashboardBox.Body>
        )}
      </DashboardAnnualContainer>
    </DashboardBox.Root>
  )
}

export default DashboardAnnualCommitmentVsRealizationProvince
