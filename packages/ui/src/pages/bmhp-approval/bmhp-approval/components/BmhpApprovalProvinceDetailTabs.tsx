'use client'

import { PropsWithChildren, useMemo } from 'react'
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

import { useBmhpApprovalDetailData } from '../list/hooks/useBmhpApprovalDetailData'
import BmhpApprovalProvinceDetailContext from '../tabs/province-completeness/libs/bmhp-approval-province-detail.context'

type TProps = PropsWithChildren

const BmhpApprovalProvinceDetailTabs: React.FC<TProps> = ({ children }) => {
  const { t } = useTranslation(['common', 'bmhpApproval'])

  const {
    pathname,
    query: { year_id },
    push,
    getAsLink,
  } = useSmileRouter() as {
    basePath: string
    pathname: string
    query: { lang?: string; program?: string; year_id?: string }
    push: (path: string) => void
    getAsLink: (path: string) => string
  }

  const {
    approvalData,
    isLoadingApproval,
    isFetchingApproval,
    refetchApprovalData,
  } = useBmhpApprovalDetailData()

  useSetLoadingPopupStore(isLoadingApproval || isFetchingApproval)

  const routerPath = `/v5/bmhp-approval-province/${year_id}/detail`

  const tabs = useMemo(
    () => [
      {
        id: 'bmhp_province_detail_area_program_tab',
        label: t('bmhpApproval:detail_tabs.area_program_plan'),
        href: `${routerPath}/area-program-plans`,
        segment: 'area-program-plans',
      },
      {
        id: 'bmhp_province_detail_completeness_tab',
        label: t('bmhpApproval:detail_tabs.completeness_monitoring'),
        href: `${routerPath}/completeness-monitoring`,
        segment: 'completeness-monitoring',
      },
      {
        id: 'bmhp_province_detail_needs_aggregate_tab',
        label: t('bmhpApproval:detail_tabs.needs_aggregate'),
        href: `${routerPath}/needs-aggregate`,
        segment: 'needs-aggregate',
      },
      {
        id: 'bmhp_province_detail_procurement_tab',
        label: t('bmhpApproval:detail_tabs.procurement_recapitulation'),
        href: `${routerPath}/procurement-recapitulation`,
        segment: 'procurement-recapitulation',
      },
    ],
    [t, routerPath]
  )

  const currentSegment = useMemo(
    () => pathname?.split('/').pop() ?? '',
    [pathname]
  )

  const activeTabLabel = useMemo(() => {
    return tabs.find((tab) => tab.segment === currentSegment)?.label ?? ''
  }, [tabs, currentSegment])

  const pageTitle = useMemo(() => {
    const base = `${t('bmhpApproval:label.title')} ${approvalData?.year ?? ''}`
    return activeTabLabel ? `${base} - ${activeTabLabel}` : base
  }, [t, approvalData, activeTabLabel])

  const contextValue = useMemo(
    () => ({
      approvalData: approvalData ?? null,
      refetchApprovalData,
    }),
    [approvalData, refetchApprovalData]
  )

  return (
    <BmhpApprovalProvinceDetailContext.Provider value={contextValue}>
      <Meta title={`SMILE | ${pageTitle}`} />
      <Container
        title={`${t('bmhpApproval:label.details')} ${t('bmhpApproval:label.title')} ${approvalData?.year ?? ''}`}
        withLayout
        backButton={{
          label: t('common:back'),
          show: true,
          onClick: () => {
            push(
              `/v5/bmhp-approval-province/${year_id}/completeness-monitoring`
            )
          },
        }}
      >
        <div className="ui-mt-6">
          <TabsLinkRoot variant="default">
            <TabsLinkList>
              {tabs.map((item) => (
                <TabsLinkTrigger
                  key={item.id}
                  data-testid={item.id}
                  href={getAsLink(item.href)}
                  active={item.segment === currentSegment}
                >
                  {item.label}
                </TabsLinkTrigger>
              ))}
            </TabsLinkList>
          </TabsLinkRoot>

          {/* Tab content */}
          <div className="ui-mt-6">{children}</div>
        </div>
      </Container>
    </BmhpApprovalProvinceDetailContext.Provider>
  )
}

export default BmhpApprovalProvinceDetailTabs
