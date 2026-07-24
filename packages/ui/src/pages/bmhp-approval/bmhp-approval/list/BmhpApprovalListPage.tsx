import React, { useCallback, useMemo, useState } from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import { useQuery } from '@tanstack/react-query'
import { Button } from '#components/button'
import {
  FilterFormBody,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
  UseFilter,
  useFilter,
} from '#components/filter'
import Export from '#components/icons/Export'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { ModalSignatureLink } from '#components/modules/ModalSignatureLink'
import ChainIcon from '#components/icons/ChainIcon'
import { toast } from '#components/toast'
import { useGetBmhpSignature } from '../../bmhp-approval-ministry/detail/hooks/useGetBmhpSignature'
import { useUpsertBmhpSignature } from '../../bmhp-approval-ministry/detail/hooks/useUpsertBmhpSignature'

import {
  exportProvinceApprovals,
  listBmhpPlanningYears,
} from '../services/bmhp-planning.services'
import BmhpApprovalProvinceButton from './components/BmhpApprovalProvinceButton'
import BmhpApprovalTable from './components/BmhpApprovalTable'
import { useBmhpApprovalList } from './hooks/useBmhpApprovalList'
import { useBmhpProvinceApprovalList } from './hooks/useBmhpProvinceApprovalList'
import {
  ListBmhpApprovalParams,
  ListBmhpProvinceApprovalParams,
} from './libs/bmhp-approval-list.type'
import { provinceApprovalFilterSchema } from './libs/bmhp-province-approval.filter'

const BmhpApprovalListPage: React.FC = () => {
  const { t } = useTranslation(['bmhpApproval', 'common'])
  const { asPath } = useSmileRouter()
  const isProvincePath = asPath.includes('bmhp-approval-province')

  // ── Applied filters (for Province View) ───────────────────────────────────
  const [appliedFilters, setAppliedFilters] = useState<{
    program_plan_id?: number
    keyword?: string
  }>({})
  const [isExporting, setIsExporting] = useState(false)
  const [isSignatureLinkOpen, setIsSignatureLinkOpen] = useState(false)

  const upsertSignature = useUpsertBmhpSignature()
  const { data: signatureData } = useGetBmhpSignature()

  const filterSchema = useMemo<UseFilter>(
    () => provinceApprovalFilterSchema({ t: t as any }),
    [t]
  )
  const filter = useFilter(filterSchema)

  // ── Pagination ─────────────────────────────────────────────────────────────
  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      item_per_page: parseAsInteger.withDefault(10),
    },
    { history: 'push' }
  )

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFilterSubmit = useCallback(() => {
    const values = filter.getValues()
    let programPlanId: number | undefined
    if (values.program_plan_id?.value) {
      programPlanId = Number(values.program_plan_id.value)
    } else if (values.program_plan_id) {
      programPlanId = Number(values.program_plan_id)
    }

    setAppliedFilters({
      program_plan_id: programPlanId,
      keyword: values.keyword ? String(values.keyword) : undefined,
    })
    setPagination({ page: 1 })
  }, [filter, setPagination])

  const handleExport = useCallback(async () => {
    setIsExporting(true)
    try {
      const values = filter.getValues()
      let programPlanId: number | undefined
      if (values.program_plan_id?.value) {
        programPlanId = Number(values.program_plan_id.value)
      } else if (values.program_plan_id) {
        programPlanId = Number(values.program_plan_id)
      }

      await exportProvinceApprovals({
        program_plan_id: programPlanId as number,
        keyword: values.keyword ? String(values.keyword) : undefined,
      })
    } finally {
      setIsExporting(false)
    }
  }, [filter])

  const handleFilterReset = useCallback(() => {
    filter.reset()
    setAppliedFilters({})
    setPagination({ page: 1 })
  }, [filter, setPagination])

  // ── Pre-fetch years for default value ───────────────────────────────────
  const { data: yearsData } = useQuery({
    queryKey: [
      'bmhp-planning-years',
      { page: 1, paginate: 10, sort_by: 'year', sort_type: 'desc' },
    ],
    queryFn: () =>
      listBmhpPlanningYears({
        page: 1,
        paginate: 10,
        sort_by: 'year',
        sort_type: 'desc',
      }),
    enabled: isProvincePath,
  })

  // ── Sync default filter when yearsData arrives ────────────────────────────
  React.useEffect(() => {
    if (
      isProvincePath &&
      yearsData?.data?.length &&
      !appliedFilters.program_plan_id
    ) {
      const currentYear = new Date().getFullYear()
      // Prefer the current year, fall back to the most recent (first)
      const defaultYear =
        yearsData.data.find((y: { year: number }) => y.year === currentYear) ??
        yearsData.data[0]

      if (defaultYear) {
        setAppliedFilters((prev) => ({
          ...prev,
          program_plan_id: defaultYear.id,
        }))
        filter.setValue('program_plan_id', {
          value: defaultYear.id,
          label: String(defaultYear.year),
        })
      }
    }
  }, [isProvincePath, yearsData, appliedFilters.program_plan_id, filter])

  // ── Data Fetching (Regency - Standard) ────────────────────────────────────
  const regencyParams: ListBmhpApprovalParams = useMemo(
    () => ({
      page: pagination.page,
      item_per_page: pagination.item_per_page,
    }),
    [pagination]
  )

  const {
    data: regencyData,
    isLoading: regencyLoading,
    isFetching: regencyFetching,
  } = useBmhpApprovalList({
    params: regencyParams,
    enabled: !isProvincePath,
  })

  // ── Data Fetching (Province - Districts list) ─────────────────────────────
  const provinceParams: ListBmhpProvinceApprovalParams = useMemo(
    () => ({
      program_plan_id: appliedFilters.program_plan_id || 0,
      keyword: appliedFilters.keyword || undefined,
      page: pagination.page,
      paginate: pagination.item_per_page,
    }),
    [appliedFilters, pagination]
  )

  const {
    data: provinceData,
    isLoading: provinceLoading,
    isFetching: provinceFetching,
  } = useBmhpProvinceApprovalList({
    params: provinceParams,
    enabled: isProvincePath && !!appliedFilters.program_plan_id,
  })

  const data = isProvincePath ? provinceData : regencyData
  const isLoading = isProvincePath ? provinceLoading : regencyLoading
  const isFetching = isProvincePath ? provinceFetching : regencyFetching

  useSetLoadingPopupStore(isLoading || isFetching)

  return (
    <>
      <Container title={t('bmhpApproval:label.title')} withLayout>
      <Meta title={'SMILE | ' + t('bmhpApproval:label.title')} />

      <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
        <h5 className="ui-font-bold ui-text-xl">
          {t('bmhpApproval:label.list')}
        </h5>
        {!isProvincePath && (
          <Button
            variant="outline"
            color="primary"
            leftIcon={<ChainIcon className="ui-size-5" />}
            onClick={() => setIsSignatureLinkOpen(true)}
          >
            {t('bmhpApproval:button.add_signature_link')}
          </Button>
        )}
      </div>

      <div className="ui-space-y-4">
        {isProvincePath && (
          <FilterFormRoot
            onSubmit={(e) => {
              filter.handleSubmit(e)
              handleFilterSubmit()
            }}
          >
            <FilterFormBody className="ui-flex ui-flex-row ui-items-end ui-gap-2">
              <div className="ui-flex ui-flex-1 ui-gap-2">
                {filter.renderField()}
              </div>
              <div className="ui-flex ui-gap-2">
                <Button
                  id="btn-export"
                  type="button"
                  variant="subtle"
                  leftIcon={<Export className="ui-size-5" />}
                  loading={isExporting}
                  disabled={isExporting}
                  onClick={handleExport}
                >
                  {t('common:export')}
                </Button>
                <FilterResetButton
                  onClick={handleFilterReset}
                  variant="subtle"
                />
                <FilterSubmitButton
                  className="ui-w-40"
                  variant="outline"
                  text={t('common:search')}
                />
              </div>
            </FilterFormBody>
          </FilterFormRoot>
        )}
        {isProvincePath && (
          <div className="ui-flex ui-justify-end">
            <BmhpApprovalProvinceButton
              programPlanId={appliedFilters.program_plan_id}
              disabled={
                !!provinceData?.meta?.submitted_to_ministry ||
                (provinceData?.total_item ?? 0) === 0 ||
                provinceData?.meta?.reviewed !== provinceData?.total_item
              }
            />
          </div>
        )}
        <BmhpApprovalTable
          data={data?.data ?? []}
          page={pagination.page}
          pageSize={pagination.item_per_page}
          isLoading={isLoading || isFetching}
          isProvinceUser={isProvincePath}
        />

        {isProvincePath && data?.meta && data?.meta && (
          <div className="ui-flex ui-justify-end ui-gap-2">
            <span className="ui-text-sm ui-text-neutral-500 ui-flex ui-items-center ui-gap-1">
              {/* tambahkan icon centang */}
              <CheckCircleIcon className="ui-size-4 ui-text-green-500" />
              {data?.meta?.submitted}{' '}
              {t('bmhpApproval:province_status.submitted')}
            </span>
            <span className="ui-text-sm ui-text-neutral-500 ui-flex ui-items-center ui-gap-1">
              {/* tambahkan icon silang */}
              <XCircleIcon className="ui-size-4 ui-text-red-500" />
              {data?.meta?.not_submitted}{' '}
              {t('bmhpApproval:province_status.not_submitted')}
            </span>
          </div>
        )}

        <PaginationContainer>
          <PaginationSelectLimit
            size={pagination.item_per_page}
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
      </div>
    </Container>

      <ModalSignatureLink
        open={isSignatureLinkOpen}
        setOpen={setIsSignatureLinkOpen}
        isLoading={upsertSignature.isPending}
        defaultValues={signatureData?.data ?? undefined}
        hideProgram={true}
        onSubmit={(data) => {
          upsertSignature.mutate(data, {
            onSuccess: () => {
              toast.success({
                description: t(
                  'bmhpApproval:statement_letter.add_signature_success',
                  {
                    defaultValue: 'Successfully added signature.',
                  }
                ),
              })
              setIsSignatureLinkOpen(false)
            },
            onError: (error: any) => {
              toast.danger({
                description:
                  error?.response?.data?.message ||
                  t('common:error_occurred', {
                    defaultValue: 'An error occurred.',
                  }),
              })
            },
          })
        }}
      />
    </>
  )
}

export default BmhpApprovalListPage
