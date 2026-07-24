import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '#components/tabs'
import { useAnnualPlanningEnabled } from '#hooks/useAnnualPlanningEnabled'

import AnnualPlanningProcessDetailInformationContent from './components/AnnualPlanningProcessDetailTabContents/AnnualPlanningProcessDetailInformationContent'
import AnnualPlanningProcessMaterialIPContent from './components/AnnualPlanningProcessDetailTabContents/AnnualPlanningProcessMaterialIPContent'
import AnnualPlanningProcessPopulationContent from './components/AnnualPlanningProcessDetailTabContents/AnnualPlanningProcessPopulationContent'
import AnnualPlanningProcessResultTabContent from './components/AnnualPlanningProcessDetailTabContents/AnnualPlanningProcessResultTabContent'
import FormCalculationResultInformation from './components/FormCalculationResultInformation'
import { useAnnualPlanningProcessDetailPage } from './hooks/useAnnualPlanningProcessDetailPage'
import { useAnnualPlanningProcessPermission } from './hooks/useAnnualPlanningProcessPermission'
import { useModalCalculationInformation } from './store/modal-calculation-information.store'

const AnnualPlanningProcessDetailPage: React.FC = () => {
  const {
    t,
    query,
    setQuery,
    dataDetail,
    dataDetailPopulationTarget,
    columnsPopulationTarget,
    dataDetailDistrictIP,
  } = useAnnualPlanningProcessDetailPage()
  const { setOpenCalculationInformation } = useModalCalculationInformation()
  useAnnualPlanningProcessPermission('detail', dataDetail?.status)
  const { isDisabledAnnual } = useAnnualPlanningEnabled()
  if (isDisabledAnnual) return <AppLayout title=""><div /></AppLayout>

  return (
    <AppLayout
      title={t('annualPlanningProcess:detail.title')}
      showInformation={query.tab === 'result'}
      onClickInformation={() => setOpenCalculationInformation(true)}
    >
      <Meta title={t('annualPlanningProcess:detail.meta')} />
      <FormCalculationResultInformation />

      <TabsRoot
        value={query.tab}
        variant="default"
        onValueChange={(e) => setQuery({ tab: e })}
      >
        <TabsList>
          <TabsTrigger value="area">{t('annualPlanningProcess:detail.section.area_program_plan')}</TabsTrigger>
          <TabsTrigger value="population">{t('annualPlanningProcess:detail.section.population_adjustment')}</TabsTrigger>
          <TabsTrigger value="ip">{t('annualPlanningProcess:detail.section.define_ip')}</TabsTrigger>
          <TabsTrigger value="result">{t('annualPlanningProcess:detail.section.result')}</TabsTrigger>
        </TabsList>
        <TabsContent value="area">
          <AnnualPlanningProcessDetailInformationContent data={dataDetail} />
        </TabsContent>
        <TabsContent value="population">
          <AnnualPlanningProcessPopulationContent
            data={dataDetailPopulationTarget || []}
            columns={columnsPopulationTarget}
          />
        </TabsContent>
        <TabsContent value="ip">
          <AnnualPlanningProcessMaterialIPContent data={dataDetailDistrictIP?.data || []} />
        </TabsContent>
        <TabsContent value="result">
          <AnnualPlanningProcessResultTabContent data={dataDetail} />
        </TabsContent>
      </TabsRoot>
    </AppLayout>
  )
}

export default AnnualPlanningProcessDetailPage
