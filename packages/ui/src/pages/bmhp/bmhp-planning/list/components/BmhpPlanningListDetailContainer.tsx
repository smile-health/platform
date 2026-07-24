import { ReactNode, useMemo } from 'react'
import { EmptyState } from '#components/empty-state'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import {
  TabsLinkList,
  TabsLinkRoot,
  TabsLinkTrigger,
} from '#components/tabs-link'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { useBmhpPlanningDetailData } from '../hooks/useBmhpPlanningDetailData'
import BmhpPlanningDetailContext from '../libs/bmhp-planning-list.context'
import BmhpPlanningInfoBox from './BmhpPlanningInfoBox'

type TProps = {
  children: ReactNode
}

const BmhpPlanningListDetailContainer: React.FC<TProps> = ({ children }) => {
  const { t } = useTranslation(['common', 'bmhpPlanning'])

  const {
    basePath,
    pathname,
    query: { lang, program, year_id },
    push,
  } = useSmileRouter() as {
    basePath: string
    pathname: string
    query: { lang?: string; program?: string; year_id?: string }
    push: (path: string) => void
  }

  const {
    detailYearData,
    isLoadingDetailYear,
    isFetchingDetailYear,
    refetchYearData,
  } = useBmhpPlanningDetailData()

  useSetLoadingPopupStore(isLoadingDetailYear || isFetchingDetailYear)

  const routerPath = `${basePath}/${lang}/${program}/v5/bmhp-planning/${year_id}`

  const tabs = useMemo(
    () => [
      {
        id: 'bmhp_planning_target_group_tab',
        label: t('bmhpPlanning:tabs.target_group'),
        href: `${routerPath}/target-group`,
      },
      // {
      //   id: 'bmhp_planning_populasi_tab',
      //   label: t('bmhpPlanning:tabs.populasi'),
      //   href: `${routerPath}/populasi`,
      // },
      {
        id: 'bmhp_planning_method_tab',
        label: t('bmhpPlanning:tabs.method'),
        href: `${routerPath}/method`,
      },
      {
        id: 'bmhp_planning_parameter_tab',
        label: t('bmhpPlanning:tabs.parameter'),
        href: `${routerPath}/parameter`,
      },
      {
        id: 'bmhp_planning_jenis_pemeriksaan_tab',
        label: t('bmhpPlanning:tabs.jenis_pemeriksaan'),
        href: `${routerPath}/jenis-pemeriksaan`,
      },
      {
        id: 'bmhp_planning_variant_tab',
        label: t('bmhpPlanning:tabs.variant'),
        href: `${routerPath}/variant`,
      },
      {
        id: 'bmhp_planning_material_tab',
        label: t('bmhpPlanning:tabs.material'),
        href: `${routerPath}/material`,
      },
      {
        id: 'bmhp_planning_master_pemeriksaan_tab',
        label: t('bmhpPlanning:tabs.master_pemeriksaan'),
        href: `${routerPath}/master-pemeriksaan`,
      },
    ],
    [t, routerPath]
  )

  const activeTabLabel = useMemo(() => {
    const currentSegment = pathname?.split('/').pop()
    return (
      tabs.find((tab) => tab.href?.split('/').pop() === currentSegment)
        ?.label ?? ''
    )
  }, [tabs, pathname])

  const pageTitle = useMemo(() => {
    const base = `${t('bmhpPlanning:title')} ${detailYearData?.year ?? ''}`
    return activeTabLabel ? `${base} - ${activeTabLabel}` : base
  }, [t, detailYearData, activeTabLabel])

  const contextValue = useMemo(
    () => ({
      yearData: detailYearData ?? null,
      refetchYearData,
    }),
    [detailYearData, refetchYearData]
  )

  if (!detailYearData && !isLoadingDetailYear && !isFetchingDetailYear) {
    return (
      <Container
        title={t('common:error.404_data.title')}
        withLayout
        backButton={{
          label: t('common:back_to_list'),
          show: true,
          onClick: () => {
            push('/v5/bmhp-planning')
          },
        }}
      >
        <EmptyState
          withIcon
          description={t('common:error.404_data.description')}
        />
      </Container>
    )
  }

  return (
    <BmhpPlanningDetailContext.Provider value={contextValue}>
      <Meta title={`SMILE | ${pageTitle}`} />
      <Container
        title={`${t('bmhpPlanning:title')} ${detailYearData?.year ?? ''}`}
        withLayout
        backButton={{
          label: t('common:back'),
          show: true,
          onClick: () => {
            push('/v5/bmhp-planning')
          },
        }}
      >
        <div className="ui-mt-6">
          <div className="ui-mb-6">
            <BmhpPlanningInfoBox />
          </div>
          <TabsLinkRoot variant="pills" align="center">
            <TabsLinkList className="!ui-flex !ui-justify-center !ui-items-center !ui-w-full">
              {tabs?.map((item) => {
                const isActive =
                  pathname?.split('/').pop() === item?.href?.split('/').pop()
                return (
                  <TabsLinkTrigger
                    {...item}
                    data-testid={item?.id}
                    key={item?.label}
                    active={isActive}
                    className="ui-justify-center ui-text-center !ui-w-full !ui-h-full"
                  >
                    {item?.label}
                  </TabsLinkTrigger>
                )
              })}
            </TabsLinkList>
          </TabsLinkRoot>
        </div>
        {children}
      </Container>
    </BmhpPlanningDetailContext.Provider>
  )
}

export default BmhpPlanningListDetailContainer
