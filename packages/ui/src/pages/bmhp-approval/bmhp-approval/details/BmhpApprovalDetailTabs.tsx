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
import { useProfile } from '#shared/auth'
import { useTranslation } from 'react-i18next'

import { useBmhpApprovalDetailData } from '../list/hooks/useBmhpApprovalDetailData'
import BmhpApprovalDetailContext from '../list/libs/bmhp-approval-detail.context'

type TProps = PropsWithChildren

const BmhpApprovalDetailTabs: React.FC<TProps> = ({ children }) => {
  const { t } = useTranslation(['common', 'bmhpApproval'])
  const { data: profile } = useProfile()

  const {
    pathname,
    query: { year_id, regency_id, regency_name },
    push,
    getAsLink,
  } = useSmileRouter() as {
    basePath: string
    pathname: string
    query: {
      lang?: string
      program?: string
      year_id?: string
      regency_id?: string
      entity_id?: string
      regency_name?: string
    }
    push: (path: string) => void
    getAsLink: (path: string) => string
  }

  const {
    approvalData,
    isLoadingApproval,
    isFetchingApproval,
    refetchApprovalData,
  } = useBmhpApprovalDetailData()

  // Determine regency and province names:
  // Priority 1: From URL query (when province user clicks from list)
  // Priority 2: From approvalData (if API provides it)
  // Priority 3: From user profile (for regency-level users)
  const regencyName = useMemo(() => {
    // From URL query (passed from list page)
    if (regency_name) {
      return decodeURIComponent(regency_name)
    }
    // From approvalData (provided by API)
    if (approvalData?.regency) {
      return approvalData.regency
    }
    // From user profile (for regency-level users)
    return profile?.entity?.regency?.name ?? '-'
  }, [regency_name, approvalData, profile])

  const provinceName = useMemo(() => {
    // From user profile (province users)
    if (profile?.entity?.province?.name) {
      return profile.entity.province.name
    }
    // From approvalData
    if (approvalData?.province) {
      return approvalData.province
    }
    // Fallback
    return '-'
  }, [approvalData, profile])

  useSetLoadingPopupStore(isLoadingApproval || isFetchingApproval)

  const isProvincePath = pathname.includes('bmhp-approval-province')
  const baseUrl = isProvincePath
    ? `/v5/bmhp-approval-province`
    : `/v5/bmhp-approval`
  const regencySegment = regency_id ? `/${regency_id}` : ''

  const routerPath = `${baseUrl}/${year_id}${regencySegment}/detail`

  // const routerPath = `/v5/bmhp-approval/${year_id}/detail`

  const tabs = useMemo(
    () => [
      {
        id: 'bmhp_detail_area_program_tab',
        label: t('bmhpApproval:detail_tabs.area_program_plan'),
        href: `${routerPath}/area-program-plans`,
        segment: 'area-program-plans',
      },
      {
        id: 'bmhp_detail_completeness_tab',
        label: t('bmhpApproval:detail_tabs.completeness_monitoring'),
        href: `${routerPath}/completeness-monitoring`,
        segment: 'completeness-monitoring',
      },
      {
        id: 'bmhp_detail_target_tab',
        label: t('bmhpApproval:detail_tabs.target_adjustment'),
        href: `${routerPath}/target-and-adjustment`,
        segment: 'target-and-adjustment',
      },
      {
        id: 'bmhp_detail_need_tab',
        label: t('bmhpApproval:detail_tabs.need_calculation_result'),
        href: `${routerPath}/need-calculation-result`,
        segment: 'need-calculation-result',
      },
      {
        id: 'bmhp_detail_procurement_tab',
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
      regencyName,
      provinceName,
    }),
    [approvalData, refetchApprovalData, regencyName, provinceName]
  )

  return (
    <BmhpApprovalDetailContext.Provider value={contextValue}>
      <Meta title={`SMILE | ${pageTitle}`} />
      <Container
        title={`${t('bmhpApproval:label.details')} ${t('bmhpApproval:label.title')} ${approvalData?.year ?? ''}`}
        withLayout
        backButton={{
          label: t('common:back'),
          show: true,
          onClick: () => {
            push(baseUrl)
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
    </BmhpApprovalDetailContext.Provider>
  )
}

export default BmhpApprovalDetailTabs
