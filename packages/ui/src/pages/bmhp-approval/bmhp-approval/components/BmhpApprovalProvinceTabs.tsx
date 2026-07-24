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
import BmhpApprovalProvinceDetailContext from '../tabs/province-completeness/libs/bmhp-approval-province-detail.context'

type TProps = PropsWithChildren

const BmhpApprovalProvinceTabs: React.FC<TProps> = ({ children }) => {
  const { t } = useTranslation(['common', 'bmhpApproval'])

  const router = useSmileRouter() as {
    pathname: string
    query: { lang?: string; program?: string; year_id?: string }
    push: (path: string) => void
  }
  const { pathname, query: { year_id }, push } = router

  const {
    approvalData,
    isLoadingApproval,
    isFetchingApproval,
    refetchApprovalData,
  } = useBmhpApprovalDetailData()

  useSetLoadingPopupStore(isLoadingApproval || isFetchingApproval)

  const routerPath = `/v5/bmhp-approval-province/${year_id}`

  const tabs = useMemo(
    () => [
      {
        id: 'bmhp_approval_province_completeness_tab',
        label: t('bmhpApproval:tabs.completeness_monitoring'),
        href: `${routerPath}/completeness-monitoring`,
      },
      {
        id: 'bmhp_approval_province_needs_aggregate_tab',
        label: t('bmhpApproval:tabs.needs_aggregate'),
        href: `${routerPath}/needs-aggregate`,
      },
      {
        id: 'bmhp_approval_province_procurement_recapitulation_tab',
        label: t('bmhpApproval:tabs.procurement_recapitulation'),
        href: `${routerPath}/procurement-recapitulation`,
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
    <BmhpApprovalProvinceDetailContext.Provider value={contextValue}>
      <Meta title={`SMILE | ${pageTitle}`} />
      <Container
        title={`${t('bmhpApproval:label.review')} ${approvalData?.year ?? ''}`}
        withLayout
        backButton={{
          label: t('common:back'),
          show: true,
          onClick: () => {
            push('/v5/bmhp-approval-province')
          },
        }}
      >
        <div className="ui-mt-6">
          <div className="ui-w-full">
            <div className="ui-flex ui-gap-2 ui-items-start">
              {tabs.map((item, index) => {
                const isDone = index < activeIndex
                const isItemActive = index === activeIndex
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
                        isDone
                          ? 'ui-bg-success-500'
                          : isItemActive
                            ? 'ui-bg-yellow-400'
                            : 'ui-bg-neutral-300'
                      )}
                    />
                    <p
                      className={cx(
                        'ui-text-sm ui-font-bold ui-text-center',
                        isDone
                          ? 'ui-text-success-600'
                          : isItemActive
                            ? 'ui-text-yellow-600'
                            : 'ui-text-neutral-400'
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
              {activeIndex + 1}. {activeTabLabel}
            </h2>
          </div>
        </div>
        {children}
      </Container>
    </BmhpApprovalProvinceDetailContext.Provider>
  )
}

export default BmhpApprovalProvinceTabs
