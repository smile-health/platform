'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { Button } from '#components/button'
import { EmptyState } from '#components/empty-state'
import {
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
  useFilter,
} from '#components/filter'
import EmptyFilter from '#components/icons/EmptyFilter'
import Export from '#components/icons/Export'
import ChainIcon from '#components/icons/ChainIcon'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { ModalSignatureLink } from '#components/modules/ModalSignatureLink'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { bmhpApprovalMinistryFilterSchema } from './libs/bmhp-approval-ministry.filter'
import { useBmhpApprovalMinistryList } from './hooks/useBmhpApprovalMinistryList'
import { useExportBmhpApprovalMinistry } from './hooks/useExportBmhpApprovalMinistry'
import { useGetBmhpSignature } from './detail/hooks/useGetBmhpSignature'
import { useUpsertBmhpSignature } from './detail/hooks/useUpsertBmhpSignature'
import { getUserStorage } from '#utils/storage/user'
import BmhpApprovalMinistrySummaryCards from './components/BmhpApprovalMinistrySummaryCards'
import BmhpApprovalMinistryTable from './components/BmhpApprovalMinistryTable'

// ── Main page ─────────────────────────────────────────────────────────────────

const BmhpApprovalMinistryListPage: React.FC = () => {
  const { t } = useTranslation(['bmhpApproval', 'common'])

  const userData = getUserStorage()
  const isEntityType5 = userData?.entity?.type === 5

  const [hasSearched, setHasSearched] = useState(false)
  const [isSignatureLinkOpen, setIsSignatureLinkOpen] = useState(false)

  const upsertSignature = useUpsertBmhpSignature()
  const { data: signatureData } = useGetBmhpSignature()

  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      item_per_page: parseAsInteger.withDefault(10),
    },
    { history: 'push' }
  )

  const filterSchema = useMemo(
    () => bmhpApprovalMinistryFilterSchema({ t }),
    [t]
  )

  const filter = useFilter(filterSchema)

  const params = useMemo(
    () => ({
      program_plan_id: filter.query?.program_plan_id?.value as number | undefined,
      province_id: filter.query?.province?.value as number | undefined,
      status: filter.query?.status?.value as number | undefined,
      page: pagination.page,
      paginate: pagination.item_per_page,
    }),
    [filter.query, pagination]
  )

  const { data, isLoading, isFetching } = useBmhpApprovalMinistryList({
    params,
    enabled: isEntityType5 ? true : !!filter.query?.program_plan_id,
  })

  const { exportData, isLoading: isExporting } = useExportBmhpApprovalMinistry(params)

  useSetLoadingPopupStore(isLoading || isFetching || isExporting)

  // Auto-set hasSearched for entity type 5
  React.useEffect(() => {
    if (isEntityType5 && !hasSearched) {
      setHasSearched(true)
    }
  }, [])

  const handleFilterSubmit = useCallback(
    () => {
      setPagination({ page: 1 })
      setHasSearched(true)
    },
    [setPagination]
  ) 

  const handleFilterReset = useCallback(() => {
    filter.reset()
    setPagination({ page: 1 })
    setHasSearched(false)
  }, [filter, setPagination])

  const listPagination = data?.list_pagination ?? [10, 25, 50, 100]

  return (
    <>
    <Container title={t('bmhpApproval:label.title')} withLayout>
      <Meta title={`SMILE | ${t('bmhpApproval:label.title')}`} />

      <div className="ui-space-y-4 ui-mt-6">
        {/* Filter */}
        <FilterFormRoot
          collapsible
          onSubmit={(e) => {
            filter.handleSubmit(e)
            handleFilterSubmit()
          }}
        >
          <FilterFormBody className="ui-grid-cols-3">
            {filter.renderField()}
          </FilterFormBody>
          <FilterFormFooter>
            <div className="ui-flex ui-gap-2 ui-ml-auto">
              <Button
                id="btn-export"
                type="button"
                variant="subtle"
                leftIcon={<Export className="ui-size-5" />}
                onClick={() => exportData.mutate()}
                disabled={isExporting || !hasSearched}
              >
                {t('common:export')}
              </Button>
              <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
              <FilterResetButton onClick={handleFilterReset} variant="subtle" />
              <FilterSubmitButton
                className="ui-w-[202px]"
                variant="outline"
                text={t('common:search')}
              />
            </div>
          </FilterFormFooter>
          {filter.renderActiveFilter()}
        </FilterFormRoot>

        {/* Summary cards – show after first search or entity type 5 */}
        {(hasSearched || isEntityType5) && data?.summary && (
          <BmhpApprovalMinistrySummaryCards summary={data.summary} />
        )}

        {/* Table section */}
        <div>
          <div className="ui-flex ui-items-center ui-justify-between ui-mb-3">
            <h5 className="ui-font-bold ui-text-lg">
              {t('bmhpApproval:label.list')}
            </h5>
            <Button
              variant="outline"
              color="primary"
              leftIcon={<ChainIcon />}
              onClick={() => setIsSignatureLinkOpen(true)}
            >
              {t('bmhpApproval:button.add_signature_link')}
            </Button>
          </div>

          {!filter.query?.program_plan_id ? (
            <div className="ui-border ui-border-gray-200 ui-rounded ui-py-20">
              <EmptyState
                withIcon
                emptyIcon={<EmptyFilter className="ui-size-6" />}
                title={t('common:no_filter_selected')}
                description={t('common:please_apply_filter')}
              />
            </div>
          ) : (
            <BmhpApprovalMinistryTable
              data={data?.data ?? []}
              page={pagination.page}
              pageSize={pagination.item_per_page}
              isLoading={isLoading || isFetching}
              year={filter.query?.program_plan_id?.label as string}
              programPlanId={filter.query?.program_plan_id?.value as number}
            />
          )}
        </div>

        {/* Pagination */}
        {hasSearched && (
          <PaginationContainer>
            <PaginationSelectLimit
              size={pagination.item_per_page}
              perPagesOptions={listPagination}
              onChange={(limit) =>
                setPagination({ page: 1, item_per_page: limit })
              }
            />
            <PaginationInfo
              size={pagination.item_per_page}
              currentPage={pagination.page}
              total={data?.total_item}
            />
            <Pagination
              totalPages={data?.total_page ?? 0}
              currentPage={pagination.page}
              onPageChange={(page) => setPagination({ page })}
            />
          </PaginationContainer>
        )}
      </div>
    </Container>

    <ModalSignatureLink
      open={isSignatureLinkOpen}
      setOpen={setIsSignatureLinkOpen}
      isLoading={upsertSignature.isPending}
      defaultValues={signatureData?.data ?? undefined}
      requireProgramAndPosition
      onSubmit={(data) => {
        upsertSignature.mutate(data, {
          onSuccess: () => {
            toast.success({
              description: t('bmhpApproval:statement_letter.add_signature_success', {
                defaultValue: 'Successfully added signature.',
              }),
            })
            setIsSignatureLinkOpen(false)
          },
          onError: (error: any) => {
            toast.danger({
              description:
                error?.response?.data?.message ||
                t('common:error_occurred', { defaultValue: 'An error occurred.' }),
            })
          },
        })
      }}
    />
    </>
  )
}

export default BmhpApprovalMinistryListPage
