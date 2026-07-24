'use client'

import React, { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import {
  Drawer,
  DrawerCloseButton,
  DrawerFooter,
  DrawerHeader,
} from '#components/drawer'
import { useProfile } from '#shared/auth'
import { useTranslation } from 'react-i18next'

import { useNeedsAggregatePreview } from '../hooks/useNeedsAggregateOperations'
import { TNeedsAggregatePreviewItem } from '../libs/needs-aggregate.types'

interface PreviewDrawerProps {
  open: boolean
  onClose: () => void
  programPlanId: number
}

const PreviewDrawer: React.FC<PreviewDrawerProps> = ({
  open,
  onClose,
  programPlanId,
}) => {
  const { t } = useTranslation('bmhpApproval')
  const { data } = useProfile()

  const { data: previewData, isLoading } = useNeedsAggregatePreview({
    programPlanId,
    enabled: open && !!programPlanId,
  })

  // Extract unique examination columns from the data
  const examinationColumns = useMemo(() => {
    if (!previewData?.data || previewData.data.length === 0) return []

    const examMap = new Map<string, { name: string; unit: string }>()
    previewData.data.forEach((city) => {
      city.examination.forEach((exam) => {
        if (!examMap.has(exam.name)) {
          examMap.set(exam.name, { name: exam.name, unit: exam.unit })
        }
      })
    })
    return Array.from(examMap.values())
  }, [previewData?.data])

  // Build columns dynamically
  const columns = useMemo<ColumnDef<TNeedsAggregatePreviewItem>[]>(() => {
    const baseColumns: ColumnDef<TNeedsAggregatePreviewItem>[] = [
      {
        accessorKey: 'si_no',
        header: t('needs_aggregate.preview.col_no'),
        size: 60,
        minSize: 60,
        cell: ({ row }) => `${row.index + 1}.`,
      },
      {
        accessorKey: 'name',
        header: t('needs_aggregate.preview.col_city'),
        size: 250,
        minSize: 250,
      },
    ]

    // Add dynamic examination columns
    const examColumns: ColumnDef<TNeedsAggregatePreviewItem>[] =
      examinationColumns.map((exam) => ({
        accessorKey: `exam_${exam.name}`,
        header: () => (
          <div className="ui-flex ui-flex-col ui-items-center">
            <span>{exam.name}</span>
            <span className="ui-text-xs ui-font-normal ui-text-neutral-500">
              ({exam.unit})
            </span>
          </div>
        ),
        size: 120,
        minSize: 100,
        cell: ({ row }) => {
          const examData = row.original.examination.find(
            (e) => e.name === exam.name
          )
          return (
            <div className="ui-text-center">
              {examData?.total_needs.toLocaleString('id-ID') ?? 0}
            </div>
          )
        },
      }))

    const actionColumns: ColumnDef<TNeedsAggregatePreviewItem>[] = [
      {
        accessorKey: 'update_by',
        header: t('needs_aggregate.preview.col_updated_by'),
        size: 200,
        minSize: 200,
        cell: ({ row }) => row.original.update_by ?? '-',
      },
    ]

    return [...baseColumns, ...examColumns, ...actionColumns]
  }, [examinationColumns, t])

  // Transform data to add si_no
  const tableData = useMemo(() => {
    return previewData?.data ?? []
  }, [previewData?.data])

  return (
    <Drawer
      open={open}
      onOpenChange={(v) => !v && onClose()}
      placement="bottom"
      size="full"
      sizeHeight="xl"
      className="ui-rounded-t-3xl"
      overlayClassName="ui-z-50"
      drawerClassName="ui-z-50"
    >
      {/* Custom Header */}
      <DrawerHeader
        className="ui-border-b ui-border-neutral-200 ui-text-center"
        title={t('needs_aggregate.preview.title')}
      >
        <div onClick={onClose}>
          <DrawerCloseButton />
        </div>
      </DrawerHeader>

      {/* Province and Program Plan Info */}
      <div className="ui-flex ui-gap-6 ui-p-5 ui-pb-0 ui-flex-shrink-0">
        <div>
          <p className="ui-text-xs ui-text-neutral-500">
            {t('completeness.province')}
          </p>
          <p className="ui-text-sm ui-font-semibold ui-text-neutral-800">
            {data?.entity?.province?.name ?? '-'}
          </p>
        </div>
        <div>
          <p className="ui-text-xs ui-text-neutral-500">
            {t('completeness.program_plan')}
          </p>
          <p className="ui-text-sm ui-font-semibold ui-text-neutral-800">
            {programPlanId}
          </p>
        </div>
      </div>

      {/* Table Container */}
      <div className="ui-flex-1 ui-overflow-auto ui-p-5">
        <DataTable
          columns={columns}
          data={tableData}
          isLoading={isLoading}
          isSticky
          stickyColumns={[0, 1]}
        />
      </div>

      <DrawerFooter className="ui-border-t ui-border-neutral-200 ui-flex-shrink-0">
        <Button variant="outline" onClick={onClose}>
          {t('needs_aggregate.preview.btn_close')}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

export default PreviewDrawer
