import { useMemo } from 'react'
import Link from 'next/link'
import { Button } from '#components/button'
import {
  FilterExpandButton,
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
  UseFilter,
  useFilter,
} from '#components/filter'
import Export from '#components/icons/Export'
import Plus from '#components/icons/Plus'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import {
  TabsLinkList,
  TabsLinkRoot,
  TabsLinkTrigger,
} from '#components/tabs-link'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import DistributionDisposalListTable from './components/DistributionDisposalListTable'
import { listTabs } from './constants/tabs'
import { useDistributionDisposalListData } from './hooks/useDistributionDisposalListData'
import { useDistributionDisposalListExport } from './hooks/useDistributionDisposalListExport'
import { distributionDisposalFilterSchema } from './schemas/distribution-disposal.schema-list'
import DistributionDisposalListContext from './utils/distribution-disposal-list.context'

const DistributionDisposalListPage = () => {
  usePermission('disposal-distribution-view')
  const defaultPurpose = hasPermission(
    'disposal-distribution-enable-select-entity'
  )
    ? 'all'
    : 'sender'
  const router = useSmileRouter()
  const { t } = useTranslation(['common', 'distributionDisposal'])
  const { t: tDashboard } = useTranslation('dashboard')

  const [additionalQuery, setAdditionalQuery] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
      purpose: parseAsString.withDefault(defaultPurpose),
    },
    {
      history: 'push',
    }
  )

  const filterSchema = useMemo<UseFilter>(
    () =>
      distributionDisposalFilterSchema({
        t,
        tDashboard,
        queryKey: additionalQuery.purpose,
      }),
    [t, tDashboard, additionalQuery.purpose]
  )
  const filter = useFilter(filterSchema)

  const contextValue = useDistributionDisposalListData({
    filter,
    additionalQuery,
    setAdditionalQuery: (...args) => {
      void setAdditionalQuery(...args)
    },
  })

  const tabsItems = useMemo(() => {
    return listTabs(t)?.filter((item) => !item?.isHidden)
  }, [t, additionalQuery.purpose])

  const { exportQuery } = useDistributionDisposalListExport({
    filter,
    additionalQuery,
  })

  useSetLoadingPopupStore(contextValue.isFetching || exportQuery.isFetching)

  return (
    <AppLayout title={t('distributionDisposal:title')}>
      <Meta title={t('distributionDisposal:meta')} />
      <DistributionDisposalListContext.Provider value={contextValue}>
        <div className="mt-6">
          <TabsLinkRoot variant="pills" align="center">
            <TabsLinkList>
              {tabsItems.map((item) => (
                <TabsLinkTrigger
                  data-testid={item?.id}
                  key={item?.label}
                  onClick={() => {
                    filter.reset()
                    setAdditionalQuery({
                      purpose: item.tab,
                      page: 1,
                      paginate: 10,
                    })
                  }}
                  active={item?.tab === additionalQuery.purpose}
                  href={router.getAsLink(
                    `v5/disposal-shipment?purpose=${item?.tab}`
                  )}
                >
                  {item?.label}
                </TabsLinkTrigger>
              ))}
            </TabsLinkList>
          </TabsLinkRoot>
          <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
            <h5 className="ui-font-bold ui-text-xl">
              {t('distributionDisposal:sectionTitle')}
            </h5>
            {hasPermission('disposal-distribution-mutate') && (
              <Link
                href={router.getAsLink('/v5/disposal-shipment/create')}
                className="ui-block"
                id="create-distribution-disposal-link"
                data-testid="create-distribution-disposal-link"
              >
                <Button
                  id="create-distribution-disposal"
                  data-testid="create-distribution-disposal"
                  type="button"
                  className="ui-min-w-40"
                  leftIcon={<Plus className="ui-size-5" />}
                >
                  {t('distributionDisposal:create')}
                </Button>
              </Link>
            )}
          </div>
          <div className="ui-mt-4">
            <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
              <FilterFormBody className="ui-grid-cols-4">
                {filter.renderField()}
              </FilterFormBody>
              <FilterFormFooter>
                {filterSchema?.filter((item) => !item.hidden)?.length > 4 ? (
                  <FilterExpandButton variant="subtle" />
                ) : (
                  <div />
                )}
                <div className="ui-flex ui-gap-2">
                  <Button
                    id="btn-export"
                    variant="subtle"
                    type="button"
                    leftIcon={<Export className="ui-size-5" />}
                    onClick={() => exportQuery.refetch()}
                  >
                    {t('export')}
                  </Button>
                  <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
                  <FilterResetButton onClick={filter.reset} variant="subtle" />
                  <FilterSubmitButton
                    onClick={() =>
                      setAdditionalQuery({ ...additionalQuery, page: 1 })
                    }
                    className="ui-w-56"
                    variant="outline"
                  ></FilterSubmitButton>
                </div>
              </FilterFormFooter>
              {filter.renderActiveFilter()}
            </FilterFormRoot>
          </div>
          <div className="ui-space-y-6 ui-my-5 ui-rounded">
            <DistributionDisposalListTable />
          </div>
        </div>
      </DistributionDisposalListContext.Provider>
    </AppLayout>
  )
}

export default DistributionDisposalListPage
