'use client'

import React, { useMemo, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { useQueryClient } from '@tanstack/react-query'
import { CellContext, ColumnDef } from '@tanstack/react-table'
import { AlertDialog, AlertDialogCancel } from '#components/alert-dialog'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '#components/drawer'
import CheckV2 from '#components/icons/CheckV2'
import Export from '#components/icons/Export'
import Information from '#components/icons/Information'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { numberFormatter } from '#utils/formatter'
import { getUserStorage } from '#utils/storage/user'
import { useTranslation } from 'react-i18next'

import { useBmhpMinistryRecapitulation } from '../hooks/useBmhpMinistryRecapitulation'
import { useBmhpMinistryRecapitulationExport } from '../hooks/useBmhpMinistryRecapitulationExport'
import { useMinistryRecapitulationDetail } from './hooks/useMinistryRecapitulationDetail'
import {
  SaveDeskResultRecordPayload,
  TBmhpMinistryRecapitulationItem,
} from '../libs/bmhp-approval-ministry.type'
import {
  saveDeskResult,
  saveDeskResultRecord,
} from '../services/bmhp-approval-ministry.service'

// ── Types ───────────────────────────────────────────────────────────────────────

export interface BmhpApprovalMinistryKakoDetailItem {
  id: number
  material_id: number
  variant_id: number | null
  name: string
  unit: string
  total_kebutuhan: number
  sisa_stok: number
  usulan_pengadaan: number
  proposal_buffer: number
  hasil_desk: number
}

const MaterialNameCell = ({
  row,
}: CellContext<BmhpApprovalMinistryKakoDetailItem, unknown>) => (
  <span className="ui-font-medium">{row.original.name}</span>
)

// ── Main Page ────────────────────────────────────────────────────────────────────

const BmhpApprovalMinistryKakoDetailPage: React.FC = () => {
  const { t, i18n } = useTranslation(['bmhpApproval', 'common'])
  const queryClient = useQueryClient()
  const user = getUserStorage()
  const { query, push } = useSmileRouter() as {
    query: {
      id?: string
      id_city?: string
      regency_name?: string
      province_name?: string
      year?: string
      program_plan_id?: string | number
      entity_id?: string | number
    }
    push: (path: string) => void
  }
  const idStr = query?.id_city ?? query?.id ?? ''
  const programPlanId = query?.program_plan_id
    ? Number(query.program_plan_id)
    : null

  const isReady = !!idStr && !!programPlanId

  // Bottom sheet state
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)
  const [deskResults, setDeskResults] = useState<Record<number, string>>({})
  const [changedItems, setChangedItems] = useState<Set<number>>(new Set())
  const [isSavingDeskResult, setIsSavingDeskResult] = useState(false)

  // Alert dialog state
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [isCompletingReview, setIsCompletingReview] = useState(false)

  // Use the actual hook for ministry recapitulation data
  const {
    data: recapitulationData,
    isLoading,
    isFetching,
  } = useBmhpMinistryRecapitulation({
    params: {
      program_plan_id: programPlanId,
      entity_id: idStr ? Number(idStr) : null,
    },
    enabled: isReady,
  })

  const { exportData, isLoading: isExporting } =
    useBmhpMinistryRecapitulationExport({
      program_plan_id: programPlanId,
      entity_id: idStr ? Number(idStr) : null,
    })

  const { data: recapDetail } = useMinistryRecapitulationDetail({
    entity_id: idStr,
    program_plan_id: programPlanId,
  })

  const remainingStockDateFormatted = useMemo(() => {
    const raw = recapDetail?.data?.remaining_stock_date
    if (!raw) return '-'
    return new Date(`${raw}T00:00:00`).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }, [recapDetail?.data?.remaining_stock_date])

  const data = recapitulationData ?? {
    data: [] as TBmhpMinistryRecapitulationItem[],
  }

  useSetLoadingPopupStore(
    isLoading ||
      isFetching ||
      isExporting ||
      isSavingDeskResult ||
      isCompletingReview
  )

  const columns = useMemo<ColumnDef<BmhpApprovalMinistryKakoDetailItem>[]>(
    () => [
      {
        id: 'no',
        header: t('bmhpApproval:kako_detail.table.col_no', {
          defaultValue: 'No',
        }),
        cell: ({ row }) => row.index + 1,
        size: 56,
        meta: {
          headerClassName: 'ui-text-center',
          cellClassName: 'ui-text-center ui-text-neutral-500',
        },
      },
      {
        accessorKey: 'name',
        header: t('bmhpApproval:kako_detail.table.col_material', {
          defaultValue: 'Medical Equipment Material Name',
        }),
        size: 500,
        cell: MaterialNameCell,
      },
      {
        accessorKey: 'unit',
        header: t('bmhpApproval:kako_detail.table.col_unit', {
          defaultValue: 'Unit',
        }),
        size: 100,
        meta: {
          headerClassName: 'ui-text-center',
          cellClassName: 'ui-text-center ui-text-neutral-500',
        },
      },
      {
        accessorKey: 'total_kebutuhan',
        header: t('bmhpApproval:kako_detail.table.col_total_needs', {
          defaultValue: 'Total Needs',
        }),
        size: 140,
        meta: {
          headerClassName: 'ui-text-center',
          cellClassName: 'ui-text-center',
        },
        cell: ({ row }) =>
          numberFormatter(row.original.total_kebutuhan, i18n.language),
      },
      {
        accessorKey: 'sisa_stok',
        header: t('bmhpApproval:kako_detail.table.col_remaining_stock', {
          defaultValue: 'Remaining Stock',
        }),
        size: 140,
        meta: {
          headerClassName: 'ui-text-center',
          cellClassName: 'ui-text-center',
        },
        cell: ({ row }) =>
          numberFormatter(row.original.sisa_stok, i18n.language),
      },
      {
        accessorKey: 'usulan_pengadaan',
        header: t('bmhpApproval:kako_detail.table.col_procurement_proposal', {
          defaultValue: 'Procurement Proposal',
        }),
        size: 140,
        meta: {
          headerClassName: 'ui-text-center',
          cellClassName: 'ui-text-center',
        },
        cell: ({ row }) =>
          numberFormatter(row.original.usulan_pengadaan, i18n.language),
      },
      {
        accessorKey: 'proposal_buffer',
        header: t('bmhpApproval:kako_detail.table.col_proposal_buffer', {
          defaultValue: 'Proposal + Buffer (10%)',
        }),
        size: 140,
        meta: {
          headerClassName: 'ui-text-center',
          cellClassName: 'ui-text-center',
        },
        cell: ({ row }) =>
          numberFormatter(row.original.proposal_buffer, i18n.language),
      },
      {
        accessorKey: 'hasil_desk',
        header: t('bmhpApproval:kako_detail.table.col_desk_result', {
          defaultValue: 'Desk Result',
        }),
        size: 140,
        meta: {
          headerClassName: 'ui-text-center',
          cellClassName: 'ui-text-center',
        },
        cell: ({ row }) =>
          numberFormatter(row.original.hasil_desk, i18n.language),
      },
    ],
    [t, i18n.language]
  )

  const items = data?.data ?? []

  // Build the kako list path, preserving the program plan filter when present.
  const navigateToKakoList = () => {
    const queryParams: Record<string, string> = {}
    if (query.program_plan_id) {
      queryParams.program_plan_id = String(query.program_plan_id)
    }

    const queryString = new URLSearchParams(queryParams).toString()
    const querySuffix = queryString ? `?${queryString}` : ''
    push(`/v5/bmhp-approval-ministry/kako/${query.id}${querySuffix}`)
  }

  // Build a stable, unique key for each table row.
  const getRowKey = (item: TBmhpMinistryRecapitulationItem) =>
    `${item.id}-${item.material_id}-${item.variant_id ?? 'base'}`

  return (
    <Container
      title={t('bmhpApproval:label.kako_detail', {
        defaultValue: 'Detail Perhitungan Kebutuhan Tahunan',
      })}
      withLayout
      backButton={{
        show: true,
        onClick: navigateToKakoList,
      }}
    >
      <Meta
        title={`SMILE | ${t('bmhpApproval:label.kako_detail', { defaultValue: 'Detail Perhitungan Kebutuhan Tahunan' })}`}
      />

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
              {t('bmhpApproval:completeness.regency', { defaultValue: 'Kabupaten/Kota' })}:
            </span>
            <span className="ui-text-sm ui-font-semibold">
              {recapDetail?.data?.regency_name ?? '-'}
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

        {/* Monitoring Info Card */}
        <div
          className="ui-rounded-lg ui-p-3 ui-mb-6"
          style={{ backgroundColor: '#F1F5F9' }}
        >
          <h3 className="ui-text-l ui-font-neutral ui-text-dark-blue ui-mb-1 ui-flex ui-items-center ui-gap-2">
            <Information className="ui-size-5" />
            {t('bmhpApproval:kako.monitoring.title', {
              defaultValue: 'Silahkan tinjau rekapitulasi pengadaan',
            })}
          </h3>
          <p className="ui-text-sm ui-text-neutral-600">
            {t('bmhpApproval:kako.monitoring.description', {
              defaultValue:
                'Tinjau dan finalisasi rincian  usulan pengadaan material di tingkat kabupaten/Kota sebelum konsolidasi provinsi',
            })}
          </p>
        </div>

        {/* Table */}
        <div className="ui-bg-white ui-border ui-border-gray-200 ui-rounded-lg ui-p-4 ui-space-y-4">
          <div className="ui-flex ui-items-center ui-justify-between">
            <div className="ui-text-base">
              <p className="ui-font-semibold ui-text-dark-blue">
                {t('bmhpApproval:kako_detail.table.title', {
                  defaultValue: 'Tabel Rekapitulasi Pengadaan',
                })}
              </p>

              <p className="ui-text-sm ui-text-neutral-400">
                {t('bmhpApproval:procurement_recapitulation.table.stock_date_subtitle', {
                  date: remainingStockDateFormatted,
                  defaultValue: `Tanggal sisa stok: ${remainingStockDateFormatted} (berdasarkan input dari Dinkes Kabupaten/Kota)`,
                })}
              </p>
            </div>

            <div className="ui-flex ui-items-center ui-gap-3">
              <Button
                variant="outline"
                color="primary"
                leftIcon={<Export className="ui-size-5" />}
                onClick={() => exportData.mutate()}
                loading={isExporting}
                disabled={
                  !isReady ||
                  isLoading ||
                  isExporting ||
                  isCompletingReview ||
                  isSavingDeskResult
                }
              >
                {t('common:export')}
              </Button>

              <div className="ui-w-px ui-h-6 ui-bg-gray-300" />

              <Button
                variant="outline"
                color="primary"
                onClick={() => {
                  // Initialize deskResults with current values and reset changedItems
                  const initialResults: Record<number, string> = {}
                  items.forEach((item, index) => {
                    initialResults[index] = numberFormatter(
                      item.hasil_desk,
                      i18n.language
                    )
                  })
                  setDeskResults(initialResults)
                  setChangedItems(new Set())
                  setIsBottomSheetOpen(true)
                }}
                disabled={
                  !isReady ||
                  isLoading ||
                  isExporting ||
                  isCompletingReview ||
                  isSavingDeskResult
                }
              >
                {t('bmhpApproval:kako_detail.button.add_desk_result', {
                  defaultValue: 'Tambah Hasil Desk',
                })}
              </Button>

              <Button
                variant="solid"
                color="primary"
                leftIcon={<CheckV2 className="ui-size-5" />}
                onClick={() => setIsAlertOpen(true)}
                disabled={
                  !isReady ||
                  isLoading ||
                  isExporting ||
                  isCompletingReview ||
                  isSavingDeskResult
                }
              >
                {t('bmhpApproval:kako_detail.button.complete_review', {
                  defaultValue: 'Selesaikan Tinjauan',
                })}
              </Button>
            </div>
          </div>

          <DataTable
            withBorder
            id="ministryKakoDetailTable"
            columns={columns}
            data={items}
            isLoading={isLoading}
            getRowId={(_, index) => String(index)}
            withHeader
            className="ui-max-h-[calc(100vh-320px)]"
          />
        </div>
      </div>

      {/* Bottom Sheet - Tambah Hasil Desk */}
      <Drawer
        open={isBottomSheetOpen}
        onOpenChange={(open) => {
          if (!open && !isSavingDeskResult) {
            // Reset deskResults and changedItems when closing without saving
            setDeskResults({})
            setChangedItems(new Set())
          }
          if (!isSavingDeskResult) {
            setIsBottomSheetOpen(open)
          }
        }}
        placement="bottom"
        size="full"
        sizeHeight="xl"
        drawerClassName="ui-rounded-t-2xl"
        className="ui-rounded-t-2xl"
      >
        <DrawerHeader
          title={t('bmhpApproval:kako_detail.bottom_sheet.title', {
            defaultValue: 'Tambah Hasil Desk',
          })}
          className="ui-border-b ui-border-gray-200 ui-text-center ui-rounded-t-2xl ui-relative ui-pr-12 ui-py-4"
        >
          <button
            onClick={() => setIsBottomSheetOpen(false)}
            disabled={isSavingDeskResult}
            className="ui-absolute ui-right-4 ui-top-1/2 -ui-translate-y-1/2 ui-text-gray-500 hover:ui-text-gray-700 ui-p-1 disabled:ui-opacity-50 disabled:ui-cursor-not-allowed"
          >
            <XMarkIcon className="ui-h-6 ui-w-6" />
          </button>
        </DrawerHeader>

        <DrawerContent className="ui-px-4 ui-py-3">
          {/* Context Information */}
          <div className="ui-flex ui-flex-wrap ui-gap-3 ui-p-3 ui-bg-gray-50 ui-rounded-lg ui-mb-4">
            <div className="ui-flex ui-items-center ui-gap-2">
              <span className="ui-text-xs ui-text-neutral-500">
                {t('bmhpApproval:completeness.province')}:
              </span>
              <span className="ui-text-xs ui-font-semibold">
                {recapDetail?.data?.province_name ?? '-'}
              </span>
            </div>
            <span className="ui-text-neutral-300">|</span>
            <div className="ui-flex ui-items-center ui-gap-2">
              <span className="ui-text-xs ui-text-neutral-500">
                {t('bmhpApproval:completeness.regency', {
                  defaultValue: 'Kabupaten/Kota',
                })}
                :
              </span>
              <span className="ui-text-xs ui-font-semibold">
                {recapDetail?.data?.regency_name ?? '-'}
              </span>
            </div>
            <span className="ui-text-neutral-300">|</span>
            <div className="ui-flex ui-items-center ui-gap-2">
              <span className="ui-text-xs ui-text-neutral-500">
                {t('bmhpApproval:completeness.program_plan')}:
              </span>
              <span className="ui-text-xs ui-font-semibold">
                {recapDetail?.data?.year ?? '-'}
              </span>
            </div>
          </div>

          {/* Table with Inputs */}
          <div className="ui-overflow-x-auto ui-overflow-y-auto ui-max-h-[calc(100vh-280px)] ui-w-full">
            <table className="ui-w-full ui-divide-y ui-divide-gray-200">
              <thead className="ui-bg-gray-50 ui-sticky ui-top-0 ui-z-10">
                <tr>
                  <th className="ui-px-3 ui-py-2 ui-text-left ui-text-xs ui-font-medium ui-text-gray-500 ui-w-16">
                    {t('bmhpApproval:kako_detail.bottom_sheet.table.no', {
                      defaultValue: 'No',
                    })}
                  </th>
                  <th className="ui-px-3 ui-py-2 ui-text-left ui-text-xs ui-font-medium ui-text-gray-500 ui-flex-1">
                    {t('bmhpApproval:kako_detail.bottom_sheet.table.material', {
                      defaultValue: 'Nama Bahan Material Alkes',
                    })}
                  </th>
                  <th className="ui-px-3 ui-py-2 ui-text-left ui-text-xs ui-font-medium ui-text-gray-500 ui-w-24">
                    {t('bmhpApproval:kako_detail.bottom_sheet.table.unit', {
                      defaultValue: 'Unit',
                    })}
                  </th>
                  <th className="ui-px-3 ui-py-2 ui-text-right ui-text-xs ui-font-medium ui-text-gray-500 ui-w-40">
                    {t(
                      'bmhpApproval:kako_detail.bottom_sheet.table.proposal_buffer',
                      { defaultValue: 'Usulan + Buffer (10%)' }
                    )}
                  </th>
                  <th className="ui-px-3 ui-py-2 ui-text-left ui-text-xs ui-font-medium ui-text-gray-500 ui-w-64">
                    {t(
                      'bmhpApproval:kako_detail.bottom_sheet.table.desk_result',
                      { defaultValue: 'Hasil Desk' }
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="ui-bg-white ui-divide-y ui-divide-gray-200">
                {items.map((item, index) => (
                  <tr key={getRowKey(item)}>
                    <td className="ui-px-3 ui-py-2 ui-text-sm ui-text-gray-500">
                      {index + 1}
                    </td>
                    <td className="ui-px-3 ui-py-2 ui-text-sm ui-font-medium ui-flex-1">
                      {item.name}
                    </td>
                    <td className="ui-px-3 ui-py-2 ui-text-sm ui-text-gray-500">
                      {item.unit}
                    </td>
                    <td className="ui-px-3 ui-py-2 ui-text-right ui-text-sm ui-text-gray-500">
                      {item.proposal_buffer}
                    </td>
                    <td className="ui-px-3 ui-py-2">
                      <input
                        type="text"
                        value={
                          deskResults[index] ??
                          numberFormatter(item.hasil_desk, i18n.language)
                        }
                        onFocus={(e) => {
                          const raw = e.target.value
                            .replaceAll('.', '')
                            .replaceAll(',', '')
                          if (Number.parseInt(raw || '0', 10) === 0) {
                            setDeskResults((prev) => ({
                              ...prev,
                              [index]: '',
                            }))
                          }
                        }}
                        onChange={(e) => {
                          const value = e.target.value
                            .replaceAll('.', '')
                            .replaceAll(',', '')
                          setDeskResults((prev) => ({
                            ...prev,
                            [index]: value,
                          }))
                          // Track that this item has been changed
                          setChangedItems(
                            (prev) => new Set(Array.from(prev).concat(index))
                          )
                        }}
                        onBlur={(e) => {
                          const numericValue = Number.parseInt(
                            e.target.value
                              .replaceAll('.', '')
                              .replaceAll(',', '') || '0',
                            10
                          )
                          setDeskResults((prev) => ({
                            ...prev,
                            [index]: numberFormatter(
                              numericValue,
                              i18n.language
                            ),
                          }))
                        }}
                        className="ui-w-full ui-px-2 ui-py-1.5 ui-text-right ui-text-sm ui-border ui-border-gray-300 ui-rounded ui-focus:ui-outline-none ui-focus:ui-ring-2 ui-focus:ui-ring-primary-500"
                        placeholder={t(
                          'bmhpApproval:kako_detail.bottom_sheet.input.placeholder',
                          { defaultValue: 'Silahkan masukkan hasil desk' }
                        )}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DrawerContent>

        <DrawerFooter className="ui-border-t ui-border-gray-200">
          <Button
            variant="outline"
            color="neutral"
            onClick={() => {
              setIsBottomSheetOpen(false)
              setChangedItems(new Set())
            }}
          >
            {t('common:cancel', { defaultValue: 'Batal' })}
          </Button>
          <Button
            variant="solid"
            color="primary"
            onClick={async () => {
              if (!programPlanId || !idStr) return

              setIsSavingDeskResult(true)

              try {
                // Build payload with only changed items
                const payloadItems = Array.from(changedItems)
                  .map((index) => {
                    const item = items[index]
                    if (!item) return null

                    const rawValue = deskResults[index]
                    const numericValue = rawValue
                      ? Number.parseInt(
                          rawValue.replaceAll('.', '').replaceAll(',', '') ||
                            '0',
                          10
                        )
                      : item.hasil_desk

                    return {
                      material_id: item.material_id,
                      variant_id: item.variant_id ? item.variant_id : null,
                      desk_result: numericValue,
                    }
                  })
                  .filter(
                    (item): item is NonNullable<typeof item> => item !== null
                  )

                // Only call API if there are changes
                if (payloadItems.length > 0) {
                  await saveDeskResult({
                    program_plan_id: programPlanId,
                    entity_id: Number(idStr),
                    items: payloadItems,
                  })

                  // Invalidate and refetch data to get the latest from server
                  await queryClient.invalidateQueries({
                    queryKey: ['bmhp-ministry-recapitulation'],
                  })

                  // Show success toast
                  toast.success({
                    title: t(
                      'bmhpApproval:kako_detail.toast.save_success_title',
                      {
                        defaultValue: 'Berhasil',
                      }
                    ),
                    description: t(
                      'bmhpApproval:kako_detail.toast.save_success_description',
                      {
                        defaultValue: 'Hasil desk berhasil disimpan',
                      }
                    ),
                  })
                }

                setIsBottomSheetOpen(false)
                setChangedItems(new Set())
              } catch (error) {
                console.error('Error saving desk result:', error)
                toast.danger({
                  title: t('common:status.failed', { defaultValue: 'Gagal' }),
                  description: t(
                    'bmhpApproval:kako_detail.toast.save_error_description',
                    {
                      defaultValue:
                        'Terjadi kesalahan saat menyimpan hasil desk',
                    }
                  ),
                })
              } finally {
                setIsSavingDeskResult(false)
              }
            }}
            loading={isSavingDeskResult}
          >
            {t('common:save', { defaultValue: 'Simpan' })}
          </Button>
        </DrawerFooter>
      </Drawer>

      {/* Alert Dialog - Konfirmasi Selesaikan Tinjauan */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <div className="ui-px-6 ui-py-6 ui-relative">
          {/* Close Button */}
          <AlertDialogPrimitive.Cancel asChild>
            <button className="ui-absolute ui-right-4 ui-top-4 ui-text-gray-400 hover:ui-text-gray-600 ui-p-1">
              <XMarkIcon className="ui-h-5 ui-w-5" />
            </button>
          </AlertDialogPrimitive.Cancel>

          {/* Title - Required for accessibility */}
          <AlertDialogPrimitive.Title className="ui-text-lg ui-font-semibold ui-text-center ui-text-gray-800 ui-pr-8">
            {t('bmhpApproval:kako_detail.alert.complete_review.title', {
              defaultValue: 'Konfirmasi',
            })}
          </AlertDialogPrimitive.Title>

          {/* Description */}
          <AlertDialogPrimitive.Description className="ui-mt-3 ui-text-base ui-text-center ui-text-gray-600 ui-whitespace-pre-line">
            {t('bmhpApproval:kako_detail.alert.complete_review.description', {
              defaultValue:
                'Apakah anda yakin ingin menyelesaikan proses peninjauan ini \n dan menyetujui semua data?',
            })}
          </AlertDialogPrimitive.Description>
        </div>

        {/* Custom Footer with full width buttons */}
        <div className="ui-flex ui-flex-col ui-gap-3 ui-px-6 ui-pb-6 sm:ui-flex-row">
          <AlertDialogCancel>
            <Button variant="outline" color="primary" className="ui-w-full">
              {t('common:cancel', { defaultValue: 'Batal' })}
            </Button>
          </AlertDialogCancel>
          <Button
            variant="solid"
            color="primary"
            className="ui-w-full"
            onClick={async () => {
              if (!programPlanId || !idStr) return

              setIsCompletingReview(true)

              try {
                const payload: SaveDeskResultRecordPayload = {
                  program_plan_id: programPlanId,
                  entity_id: Number(idStr),
                  status_desk: 1,
                  desk_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
                  desk_by: user?.id,
                }

                await saveDeskResultRecord(payload)

                setIsAlertOpen(false)

                toast.success({
                  title: t(
                    'bmhpApproval:kako_detail.toast.complete_review_success_title',
                    {
                      defaultValue: 'Berhasil',
                    }
                  ),
                  description: t(
                    'bmhpApproval:kako_detail.toast.complete_review_success_description',
                    {
                      defaultValue: 'Tinjauan berhasil diselesaikan',
                    }
                  ),
                })

                // Navigate back to list
                navigateToKakoList()
              } catch (error) {
                console.error('Error completing review:', error)
                const apiMessage = (
                  error as { response?: { data?: { message?: string } } }
                )?.response?.data?.message
                toast.danger({
                  title: t('common:status.failed', { defaultValue: 'Gagal' }),
                  description:
                    apiMessage ??
                    t(
                      'bmhpApproval:kako_detail.toast.complete_review_error_description',
                      {
                        defaultValue:
                          'Terjadi kesalahan saat menyelesaikan tinjauan',
                      }
                    ),
                })
              } finally {
                setIsCompletingReview(false)
              }
            }}
            loading={isCompletingReview}
          >
            {t(
              'bmhpApproval:kako_detail.alert.complete_review.confirm_button',
              { defaultValue: 'Ya, Kirim' }
            )}
          </Button>
        </div>
      </AlertDialog>
    </Container>
  )
}

export default BmhpApprovalMinistryKakoDetailPage
