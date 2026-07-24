'use client'

import { PropsWithChildren, useMemo } from 'react'
import { Alert } from '#components/alert'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import cx from '#lib/cx'
import { useProfile } from '#shared/auth'
import { useTranslation } from 'react-i18next'

import { useBmhpApprovalDetailData } from '../list/hooks/useBmhpApprovalDetailData'
import BmhpApprovalDetailContext from '../list/libs/bmhp-approval-detail.context'

type TProps = PropsWithChildren

const BmhpApprovalTabs: React.FC<TProps> = ({ children }) => {
  const { t } = useTranslation(['common', 'bmhpApproval'])

  const {
    pathname,
    query: { year_id },
    push,
  } = useSmileRouter() as {
    basePath: string
    pathname: string
    query: { lang?: string; program?: string; year_id?: string }
    push: (path: string) => void
  }

  const {
    approvalData,
    isLoadingApproval,
    isFetchingApproval,
    refetchApprovalData,
  } = useBmhpApprovalDetailData()

  useSetLoadingPopupStore(isLoadingApproval || isFetchingApproval)

  // const routerPath = ``
  const routerPath = `/v5/bmhp-approval/${year_id}`

  const tabs = useMemo(
    () => [
      {
        id: 'bmhp_approval_completeness_tab',
        label: t('bmhpApproval:tabs.completeness_monitoring'),
        href: `${routerPath}/completeness-monitoring`,
        bannerTitle: t('bmhpApproval:completeness.banner_header'),
        bannerDesc: t('bmhpApproval:completeness.banner_desc'),
      },
      {
        id: 'bmhp_approval_verify_tab',
        label: t('bmhpApproval:tabs.target_adjustment'),
        href: `${routerPath}/target-and-adjustment`,
        bannerTitle: t('bmhpApproval:target_adjustment.banner_header'),
        bannerDesc: t('bmhpApproval:target_adjustment.banner_desc'),
      },
      {
        id: 'bmhp_approval_need_tab',
        label: t('bmhpApproval:tabs.need_calculation_result'),
        href: `${routerPath}/need-calculation-result`,
        bannerTitle: t('bmhpApproval:calculation_result.banner_header'),
        bannerDesc: t('bmhpApproval:calculation_result.banner_desc'),
      },
      {
        id: 'bmhp_approval_verify_tab',
        label: t('bmhpApproval:tabs.procurement_recapitulation'),
        href: `${routerPath}/procurement-recapitulation`,
        bannerTitle: t('bmhpApproval:procurement_recapitulation.banner_header'),
        bannerDesc: t('bmhpApproval:procurement_recapitulation.banner_desc'),
      },
    ],
    [t, routerPath]
  )

  const activeIndex = useMemo(() => {
    const currentSegment = pathname?.split('/').pop()
    return tabs.findIndex(
      (tab) => tab.href?.split('/').pop() === currentSegment
    )
  }, [tabs, pathname])

  const activeTabLabel = useMemo(() => {
    const currentSegment = pathname?.split('/').pop()
    return (
      tabs.find((tab) => tab.href?.split('/').pop() === currentSegment)
        ?.label ?? ''
    )
  }, [tabs, pathname])

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
  const { data: profile } = useProfile()

  const provinceName = profile?.entity?.province?.name ?? '-'
  const cityName = profile?.entity?.regency?.name ?? '-'
  const programYear = approvalData?.year ?? '-'

  return (
    <BmhpApprovalDetailContext.Provider value={contextValue}>
      <Meta title={`SMILE | ${pageTitle}`} />
      <Container
        title={`${t('bmhpApproval:label.review')} ${approvalData?.year ?? ''}`}
        withLayout
        backButton={{
          label: t('common:back'),
          show: true,
          onClick: () => {
            push('/v5/bmhp-approval')
          },
        }}
      >
        <div className="ui-mt-6">
          <div className="ui-w-full">
            <div className="ui-flex ui-gap-2 ui-items-start">
              {tabs.map((item, index) => {
                const isDone = index < activeIndex
                const isItemActive = index === activeIndex

                let bgClass = 'ui-bg-[#F5F5F4]'
                let textClass = 'ui-text-neutral-500'

                if (isDone) {
                  bgClass = 'ui-bg-[#15803D]'
                  textClass = 'ui-text-[#15803D]'
                } else if (isItemActive) {
                  bgClass = 'ui-bg-primary-500'
                  textClass = 'ui-text-primary-500'
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    data-testid={item.id}
                    className="ui-flex-1 ui-space-y-2 ui-cursor-pointer"
                    onClick={() => push(item.href)}
                  >
                    <div
                      className={cx(
                        'ui-w-full ui-h-2 ui-rounded-full',
                        bgClass
                      )}
                    />
                    <p
                      className={cx(
                        'ui-text-sm ui-font-bold ui-text-center',
                        textClass
                      )}
                    >
                      {index + 1}. {item.label}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="ui-mt-6 ui-space-y-4">
            {/* Location info banner */}
            <div className="ui-flex ui-flex-wrap ui-gap-4 ui-p-4 ui-border ui-border-gray-200 ui-rounded ui-bg-gray-50">
              <div className="ui-flex ui-items-center ui-gap-2">
                <span className="ui-text-sm ui-text-neutral-500">
                  {t('bmhpApproval:completeness.province')}:
                </span>
                <span className="ui-text-sm ui-font-semibold">
                  {provinceName}
                </span>
              </div>
              <span className="ui-text-neutral-300">|</span>
              <div className="ui-flex ui-items-center ui-gap-2">
                <span className="ui-text-sm ui-text-neutral-500">
                  {t('bmhpApproval:completeness.city')}:
                </span>
                <span className="ui-text-sm ui-font-semibold">{cityName}</span>
              </div>
              <span className="ui-text-neutral-300">|</span>
              <div className="ui-flex ui-items-center ui-gap-2">
                <span className="ui-text-sm ui-text-neutral-500">
                  {t('bmhpApproval:completeness.program_plan')}:
                </span>
                <span className="ui-text-sm ui-font-semibold">
                  {programYear}
                </span>
              </div>
            </div>

            <h2 className="ui-font-semibold ui-text-xl">
              {/* 1. Completeness Monitoring */}
              {activeIndex + 1}. {activeTabLabel}
            </h2>

            {/* Info Banner */}
            {tabs[activeIndex]?.id !== 'bmhp_approval_completeness_tab' && (
              <Alert
                type="neutral"
                withIcon
                title={tabs[activeIndex]?.bannerTitle ?? ''}
                className="ui-border"
              >
                <p className="ui-text-sm">
                  {tabs[activeIndex]?.bannerDesc ??
                    t('bmhpApproval:completeness.banner_desc')}
                </p>
              </Alert>
            )}
          </div>
        </div>
        {children}
      </Container>
    </BmhpApprovalDetailContext.Provider>
  )
}

export default BmhpApprovalTabs
