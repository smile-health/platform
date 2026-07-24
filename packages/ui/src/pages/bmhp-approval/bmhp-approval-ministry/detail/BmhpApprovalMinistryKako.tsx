'use client'

import React, { useMemo, useRef } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import Information from '#components/icons/Information'
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
import dayjs from 'dayjs'
import 'dayjs/locale/id'
import 'dayjs/locale/en'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { useBmhpApprovalKakoList } from '../hooks/useBmhpApprovalKakoList'
import { TBmhpProvinceApprovalItem } from '../../bmhp-approval/list/libs/bmhp-approval-list.type'
import { useMinistryRecapitulationDetail } from './hooks/useMinistryRecapitulationDetail'

// ── Types ───────────────────────────────────────────────────────────────────────

export interface BmhpApprovalKakoItem {
  id: number
  si_no?: number
  regency_name: string
  status_persetujuan: 'dikirim' | 'belum dikirim'
  updated_by?: string | null
  updated_at?: string | null
  action?: string
  approver_kemkes: number
  status_kemenkes: number
}

// ── Helper Functions ────────────────────────────────────────────────────────────

const mapApiItemToComponent = (item: TBmhpProvinceApprovalItem & { status_kemenkes?: number }): BmhpApprovalKakoItem => ({
  id: item.entity_id,
  si_no: item.no,
  regency_name: item.regency_name,
  status_persetujuan: item.approver_kemkes === 1 ? 'dikirim' : 'belum dikirim',
  updated_by: item.updated_by,
  updated_at: item.updated_at,
  action: item.action,
  approver_kemkes: item.approver_kemkes,
  status_kemenkes: item.status_kemenkes ?? 0,
})

// ── Helper Components ───────────────────────────────────────────────────────────

interface ActionCellProps {
  item: BmhpApprovalKakoItem
  programPlanId?: number
  provinceId?: string
}

const ActionCell: React.FC<ActionCellProps> = ({
  item,
  programPlanId,
  provinceId,
}) => {
  const router = useSmileRouter()
  const { t } = useTranslation(['bmhpApproval', 'common'])

  const queryParams: Record<string, string> = {}
  if (programPlanId) queryParams.program_plan_id = String(programPlanId)

  // status_kemenkes = 0 → show "tinjau entry" button
  if (item.status_kemenkes === 0) {
    return (
      <Button
        type="button"
        variant="outline"
        color="warning"
        size="sm"
        onClick={() => {
          router.push(`/v5/bmhp-approval-ministry/kako/${provinceId}/review/${item.id}`, null, queryParams)
        }}
      >
        {t('bmhpApproval:button.review_entry')}
      </Button>
    )
  }

  // status_kemenkes = 2 AND approver_kemkes = 1 → show "detail" button
  if (item.status_kemenkes === 3 && item.approver_kemkes === 1) {
    return (
      <Button
        type="button"
        variant="ghost"
        color="primary"
        size="sm"
        className="ui-text-warning hover:ui-text-warning hover:ui-bg-transparent"
        onClick={() => {
          router.push(`/v5/bmhp-approval-ministry/kako/${provinceId}/detail/${item.id}`, null, queryParams)
        }}
      >
        {t('bmhpApproval:button.detail')}
      </Button>
    )
  }

  // status_kemenkes = 2 AND approver_kemkes !== 1, or other statuses → show "-"
  return <span className="ui-text-neutral-400">-</span>
}

interface StatusCellProps {
  statusKemenkes: number
}

const StatusCell: React.FC<StatusCellProps> = ({ statusKemenkes }) => {
  const { t } = useTranslation(['bmhpApproval', 'common'])

  // status_kemenkes = 0 → ondesk
  // status_kemenkes = 2 → belum dikirim
  // status_kemenkes = 3 → dikirim
  const getStatusConfig = () => {
    switch (statusKemenkes) {
      case 0:
        return {
          colorClass: 'ui-text-gray-700 ui-bg-gray-100',
          text: t('bmhpApproval:kako.status.ondesk', { defaultValue: 'Ondesk' }),
        }
      case 2:
        return {
          colorClass: 'ui-text-orange-700 ui-bg-orange-50',
          text: t('bmhpApproval:kako.status.not_submitted', { defaultValue: 'Belum Dikirim' }),
        }
      case 3:
        return {
          colorClass: 'ui-text-green-700 ui-bg-green-50',
          text: t('bmhpApproval:kako.status.submitted', { defaultValue: 'Dikirim' }),
        }
      default:
        return {
          colorClass: 'ui-text-gray-700 ui-bg-gray-100',
          text: '-',
        }
    }
  }

  const { colorClass, text } = getStatusConfig()

  return (
    <div
      className={`ui-w-fit ui-px-4 ui-py-2 ui-rounded-full ui-text-sm ui-font-semibold ${colorClass}`}
    >
      {text as string}
    </div>
  )
}

interface UpdatedByCellProps {
  updatedBy?: string | null
  updatedAt?: string | null
  locale: string
}

const UpdatedByCell: React.FC<UpdatedByCellProps> = ({ updatedBy, updatedAt, locale }) => {
  if (!updatedBy && !updatedAt) {
    return <span className="ui-text-neutral-400">-</span>
  }

  const dateText = updatedAt
    ? dayjs(updatedAt).locale(locale).format('DD MMM YYYY, HH:mm')
    : '-'

  return (
    <div className="ui-flex ui-flex-col">
      <span className="ui-text-sm ui-font-medium">{updatedBy ?? '-'}</span>
      <span className="ui-text-xs ui-text-neutral-500">{dateText}</span>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────────

const BmhpApprovalMinistryKako: React.FC = () => {
  const { t, i18n } = useTranslation(['bmhpApproval', 'common'])
  const { query, push } = useSmileRouter() as {
    query: {
      id?: string
      program_plan_id?: string
    }
    push: (path: string) => void
  }

  const provinceId = query?.id
  const programPlanId = query?.program_plan_id ? parseInt(query.program_plan_id) : undefined

  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      item_per_page: parseAsInteger.withDefault(10),
    },
    { history: 'push' }
  )

  const params = useMemo(
    () => ({
      program_plan_id: programPlanId!,
      province_id: provinceId ? Number(provinceId) : undefined,
      page: pagination.page,
      paginate: pagination.item_per_page,
    }),
    [programPlanId, provinceId, pagination]
  )

  const { data, isLoading, isFetching } = useBmhpApprovalKakoList({
    params,
    enabled: !!programPlanId && !!provinceId,
  })

  const { data: recapDetail } = useMinistryRecapitulationDetail({
    province_id: provinceId ? Number(provinceId) : null,
    program_plan_id: programPlanId ?? null,
  })

  useSetLoadingPopupStore(isLoading || isFetching)

  const pageOffsetRef = useRef(0)
  pageOffsetRef.current = (pagination.page - 1) * pagination.item_per_page

  // Map API data to component format
  const items = useMemo(
    () => data?.data?.map(mapApiItemToComponent) ?? [],
    [data]
  )

  const totalItem = data?.total_item ?? 0
  const listPagination = data?.list_pagination ?? [10, 25, 50, 100]
  const totalPages = data?.total_page ?? 1

  // ── Table Columns ─────────────────────────────────────────────────────────────

  const columns = useMemo<ColumnDef<BmhpApprovalKakoItem>[]>(
    () => [
      {
        accessorKey: 'si_no',
        header: t('bmhpApproval:kako.table.no', { defaultValue: 'No' }),
        size: 60,
        meta: { cellClassName: 'ui-text-center' },
        cell: ({ row }) => row.original.si_no ?? pageOffsetRef.current + row.index + 1,
        enableSorting: false,
      },
      {
        accessorKey: 'regency_name',
        header: t('bmhpApproval:kako.table.regency_name', { defaultValue: 'Kabupaten/Kota' }),
        enableSorting: false,
        cell: ({ row }) => (
          <span className="ui-font-medium">{row.original.regency_name}</span>
        ),
      },
      {
        accessorKey: 'status_persetujuan',
        header: t('bmhpApproval:kako.table.approval_status', { defaultValue: 'Status Persetujuan' }),
        enableSorting: false,
        size: 160,
        cell: ({ row }) => <StatusCell statusKemenkes={row.original.status_kemenkes} />,
      },
      {
        accessorKey: 'updated_by',
        header: t('bmhpApproval:kako.table.updated_by', { defaultValue: 'Diperbarui Oleh' }),
        enableSorting: false,
        size: 200,
        cell: ({ row }) => (
          <UpdatedByCell
            updatedBy={row.original.updated_by}
            updatedAt={row.original.updated_at}
            locale={i18n.language || 'id'}
          />
        ),
      },
      {
        accessorKey: 'actions',
        header: t('bmhpApproval:kako.table.action', { defaultValue: 'Aksi' }),
        enableSorting: false,
        size: 140,
        cell: ({ row }) => (
          <ActionCell
            item={row.original}
            programPlanId={programPlanId}
            provinceId={provinceId}
          />
        ),
      },
    ],
    [t, i18n.language, provinceId, programPlanId]
  )

  return (
    <Container
      title={t('bmhpApproval:label.kako', { defaultValue: 'Perhitungan Kebutuhan Tahunan' })}
      withLayout
      backButton={{
        show: true,
        onClick: () => {
          const queryParams: Record<string, string> = {}
          if (programPlanId) queryParams.program_plan_id = String(programPlanId)

          const queryString = new URLSearchParams(queryParams).toString()
          const fullPath = queryString ? `/v5/bmhp-approval-ministry?${queryString}` : '/v5/bmhp-approval-ministry'
          push(fullPath)
        },
      }}
    >
      <Meta title={`SMILE | ${t('bmhpApproval:label.kako', { defaultValue: 'Perhitungan Kebutuhan Tahunan' })}`} />

      <div className="ui-mt-6 ui-space-y-4">
        {/* Location info banner */}
        <div className="ui-flex ui-flex-wrap ui-gap-4 ui-p-4 ui-border ui-border-gray-200 ui-rounded ui-bg-gray-50">
          <div className="ui-flex ui-items-center ui-gap-2">
            <span className="ui-text-sm ui-text-neutral-500">
              {t('bmhpApproval:completeness.province')}:
            </span>
            <span className="ui-text-sm ui-font-semibold">
              {recapDetail?.data?.province_name ?? '-'}
            </span>
          </div>
          <span className="ui-text-neutral-300">|</span>
          <div className="ui-flex ui-items-center ui-gap-2">
            <span className="ui-text-sm ui-text-neutral-500">
              {t('bmhpApproval:completeness.program_plan')}:
            </span>
            <span className="ui-text-sm ui-font-semibold">
              {recapDetail?.data?.year ?? '-'}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="ui-bg-white ui-py-4">
          <div className="ui-mb-5">
            <h2 className="ui-text-base ui-font-semibold ui-text-dark-blue">
              {t('bmhpApproval:kako.table.title', { defaultValue: 'Daftar Perhitungan Kebutuhan tahunan' })}
            </h2>
          </div>

          {/* Monitoring Info Card */}
          <div className="ui-rounded-lg ui-p-3 ui-mb-5" style={{ backgroundColor: '#F1F5F9' }}>
            <h3 className="ui-text-l ui-font-neutral ui-text-dark-blue ui-mb-1 ui-flex ui-items-center ui-gap-2">
              <Information className="ui-size-5" />
              {t('bmhpApproval:kako.monitoring.title', { defaultValue: 'Silahkan tinjau monitoring kelengkapan' })}
            </h3>
            <p className="ui-text-sm ui-text-neutral-600">
              {t('bmhpApproval:kako.monitoring.description', {
                defaultValue: 'Tombol untuk melihat kebutuhan agregat akan aktif setelah data untuk semua Dinkes Kabupaten/Kota telah ditandai sebagai ditinjau'
              })}
            </p>
          </div>

          <DataTable
            withBorder
            id="ministryKakoTable"
            columns={columns}
            data={items}
            isLoading={isLoading}
            getRowId={(row) => String(row.id)}
          />

          <PaginationContainer className="ui-mt-4">
            <PaginationSelectLimit
              perPagesOptions={listPagination}
              size={pagination.item_per_page}
              onChange={(val: number) =>
                setPagination({ page: 1, item_per_page: val })
              }
            />
            <PaginationInfo
              total={totalItem}
              currentPage={pagination.page}
              size={pagination.item_per_page}
            />
            <Pagination
              currentPage={pagination.page}
              totalPages={totalPages}
              onPageChange={(page: number) => setPagination({ page })}
            />
          </PaginationContainer>
        </div>
      </div>
    </Container>
  )
}

export default BmhpApprovalMinistryKako
