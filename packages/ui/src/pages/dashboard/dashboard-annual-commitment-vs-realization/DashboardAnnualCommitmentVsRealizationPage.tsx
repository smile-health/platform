import Container from '#components/layouts/PageContainer'
import React from 'react'

import Meta from '#components/layouts/Meta'
import DashboardInformation from '../components/DashboardInformation'
import DashboardBox from '../components/DashboardBox'
import DashboardFilter from '../components/DashboardFilter'
import DashboardAnnualCommitmentVsRealizationProvince from './components/DashboardAnnualCommitmentVsRealizationProvince'
import DashboardAnnualCommitmentVsRealizationMetricCard from './components/DashboardAnnualCommitmentVsRealizationMetricCard'
import DashboardAnnualCommitmentVsRealizationChart from './components/DashboardAnnualCommitmentVsRealizationChart'

import { generateMetaTitle } from '#utils/strings'
import { useDashboardAnnualCommitmentVsRealizationPage } from './hooks/useDashboardAnnualCommitmentVsRealizationPage'
import { usePermission } from '#hooks/usePermission'
import { fitBarToContainerPlugin } from './dashboard-annual-commitment-vs-realization.plugins'

const DashboardAnnualCommitmentVsRealizationPage: React.FC = () => {
  usePermission('dashboard-annual-commitment-vs-realization-view')
  const {
    t,
    information,
    filter,
    chartOptionRequirementAndRemaining,
    chartOptionNational,
    chartOptionTarget,
    downloadConfig,
    milestonePlugin,
    isEnabled,

    // data formatted from api
    dataRequirementAndRemaining,
    dataNational,
    dataRealizationAndTarget,

    // data from api
    metricSummary,
    chartRequirementAndRemaining,
    chartNational,
    chartTarget,
    dataProvince,

    handleOpenInformation,
    handleCloseInformation,
    setIsEnabled,
    mutateExport,
  } = useDashboardAnnualCommitmentVsRealizationPage()

  return (
    <Container
      title={t('title')}
      showInformation
      onClickInformation={() => handleOpenInformation({
        title: t('information.title'),
        description: t('information.description'),
        details: [],
      })}
      withLayout
    >
      <Meta title={generateMetaTitle(t('title'))} />

      <DashboardInformation
        open={Boolean(information?.title)}
        setOpen={handleCloseInformation}
        contentClassName="ui-text-sm ui-text-neutral-500"
        {...information}
      />

      <DashboardBox.Provider
        filter={filter?.query}
        colorClass="ui-bg-gray-100"
        showRegion={false}
      >
        <div className="ui-space-y-6">
          <DashboardFilter
            expandable={false}
            filter={filter}
            grid={4}
            onExport={() => mutateExport()}
            onSubmit={() => {
              // add timeout to prevent double fetch using old params
              setTimeout(() => {
                if (!isEnabled) setIsEnabled(true)
              }, 150)
            }}
            onResetFilter={() => {
              setIsEnabled(false)
              filter.reset()
            }}
          />

          <div className='ui-grid ui-grid-cols-2 ui-gap-6'>
            {/* metric total annual needs */}
            <DashboardAnnualCommitmentVsRealizationMetricCard
              title={t('box_title.total_annual_needs')}
              setInformation={() => handleOpenInformation({
                title: t('box_title.total_annual_needs'),
                description: t('box_description.total_annual_needs'),
                details: [],
              })}
              isLoading={metricSummary.isLoading}
              isEmpty={false}
              data={{ ...metricSummary.data?.annual_needs }}
            />

            {/* metric total annual commitment */}
            <DashboardAnnualCommitmentVsRealizationMetricCard
              title={t('box_title.total_annual_commitment')}
              setInformation={() => handleOpenInformation({
                title: t('box_title.total_annual_commitment'),
                description: t('box_description.total_annual_commitment'),
                details: [],
              })}
              isLoading={metricSummary.isLoading}
              isEmpty={false}
              data={{ ...metricSummary.data?.annual_commitment }}
            />
          </div>

          {/* chart annual requirement and remaining stock */}
          <DashboardAnnualCommitmentVsRealizationChart
            title={chartRequirementAndRemaining.data?.title ?? t('box_title.annual_requirements_and_remaining_stock')}
            download={downloadConfig.requirement_and_remaining}
            chartOption={chartOptionRequirementAndRemaining}
            setInformation={() => handleOpenInformation({
              title: t('box_title.annual_requirements_and_remaining_stock'),
              description: t('box_description.annual_requirements_and_remaining_stock'),
              details: [],
            })}
            isLoading={chartRequirementAndRemaining.isLoading}
            isEmpty={dataRequirementAndRemaining.data.datasets.length === 0}
            data={dataRequirementAndRemaining}
            plugins={[fitBarToContainerPlugin]}
          />

          {/* chart national */}
          <DashboardAnnualCommitmentVsRealizationChart
            title={chartNational.data?.title ?? t('box_title.annual_commitment_vs_realization_national')}
            download={downloadConfig.national}
            chartOption={chartOptionNational}
            setInformation={() => handleOpenInformation({
              title: t('box_title.annual_commitment_vs_realization_national'),
              description: t('box_description.annual_commitment_vs_realization_national'),
              details: [],
            })}
            isLoading={chartNational.isLoading}
            isEmpty={dataNational.data.datasets.length === 0}
            data={dataNational}
            plugins={[fitBarToContainerPlugin]}
          />

          {/* chart commitment vs realization target */}
          <DashboardAnnualCommitmentVsRealizationChart
            title={chartTarget.data?.title ?? t('box_title.realization_and_target')}
            download={downloadConfig.target}
            chartOption={chartOptionTarget}
            chartHeight={220}
            setInformation={() => handleOpenInformation({
              title: t('box_title.realization_and_target'),
              description: t('box_description.realization_and_target'),
              details: [],
            })}
            plugins={[milestonePlugin]}
            isLoading={chartTarget.isLoading}
            isEmpty={dataRealizationAndTarget.data.datasets.length === 0}
            data={dataRealizationAndTarget}
          />

          {/* chart commitment vs realization province */}
          <DashboardAnnualCommitmentVsRealizationProvince
            isLoading={dataProvince.isLoading}
            setInformation={() => handleOpenInformation({
              title: t('box_title.annual_commitment_vs_realization_province'),
              description: t('box_description.annual_commitment_vs_realization_province'),
              details: [],
            })}
            data={{
              data: dataProvince.data?.data || [],
              title: dataProvince.data?.title
            }}
          />
        </div>
      </DashboardBox.Provider>
    </Container>
  )
}

export default DashboardAnnualCommitmentVsRealizationPage
