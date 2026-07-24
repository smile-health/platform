import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import useSmileRouter from '#hooks/useSmileRouter'
import { DetailSectionProps } from '#pages/bmhp/master/detail/components/DetailSection'
import MasterDetailPage, {
  MasterDetailActionButton,
} from '#pages/bmhp/master/detail/MasterDetailPage'
import { queryClient } from '#provider/query-client'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { deleteBmhpHistoryType } from '../list/master.service'
import {
  GetBmhpHistoryDetail,
  GetBmhpHistoryDetailMaterial,
} from './master.service'

const BmhpHistoryDetailPage = () => {
  const { t } = useTranslation(['masterBmhp', 'common'])
  const params = useParams()
  const router = useSmileRouter()
  const basePath = `/v5/bmhp-planning/history/`
  const id = params?.id as string

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['bmhp-history-detail', id],
    queryFn: () => GetBmhpHistoryDetail(id),
    enabled: Boolean(id),
  })

  const deleteMutation = useMutation({
    mutationFn: async (historyId: number) => {
      return await deleteBmhpHistoryType(historyId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bmhp-history-list'] })
      router.push(basePath)
    },
  })

  const handleDelete = async () => {
    if (id) {
      await deleteMutation.mutateAsync(Number(id))
      setShowDeleteModal(false)
    }
  }

  const materialColumns: ColumnDef<GetBmhpHistoryDetailMaterial>[] = [
    {
      id: 'no',
      header: t('masterBmhp:table.column.no'),
      size: 60,
      cell: ({ row }) => row.index + 1,
    },
    {
      id: 'material_name',
      header: t('masterBmhp:label.material_name'),
      accessorKey: 'material_name',
    },
    {
      id: 'tag',
      header: t('masterBmhp:label.tag'),
      accessorKey: 'tag',
    },
    {
      id: 'product_template',
      header: t('masterBmhp:label.product_template'),
      accessorKey: 'product_template',
    },
    {
      id: 'product_variant',
      header: t('masterBmhp:label.product_variant'),
      accessorKey: 'product_variant',
    },
    {
      id: 'history_previous_year',
      header: t('masterBmhp:label.history_previous_year'),
      accessorKey: 'history_previous_year',
    },
    {
      id: 'estimated_need',
      header: t('masterBmhp:label.estimated_need'),
      accessorKey: 'estimated_need',
    },
    {
      id: 'unit',
      header: t('masterBmhp:label.unit'),
      accessorKey: 'unit',
    },
  ]

  const sections: DetailSectionProps[] = [
    {
      id: 'detail-info',
      title: t('masterBmhp:section.detail_info'),
      fields: [
        {
          id: 'entity_name',
          label: t('masterBmhp:label.entity'),
          value: data?.entity?.name || '-',
        },
        {
          id: 'entity_address',
          label: t('masterBmhp:label.address'),
          value: data?.entity?.address || '-',
        },
        {
          id: 'year',
          label: t('masterBmhp:label.year'),
          value: data?.year?.toString() || '-',
        },
        // {
        //   id: 'status',
        //   label: t('masterBmhp:label.status'),
        //   value: data?.status || '-',
        // },
        {
          id: 'examination_name',
          label: t('masterBmhp:label.examination_name'),
          value: data?.examination_name || '-',
        },
        {
          id: 'examination_type',
          label: t('masterBmhp:label.examination_type'),
          value: data?.examination_type || '-',
        },
        {
          id: 'examination_method',
          label: t('masterBmhp:label.examination_method'),
          value: data?.examination_method || '-',
        },
        {
          id: 'submitted_at',
          label: t('masterBmhp:label.submitted_at'),
          value: data?.submitted_at
            ? dayjs(data.submitted_at).format('DD-MM-YYYY HH:mm:ss')
            : '-',
        },
        {
          id: 'approved_at',
          label: t('masterBmhp:label.approved_at'),
          value: data?.approved_at
            ? dayjs(data.approved_at).format('DD-MM-YYYY HH:mm:ss')
            : '-',
        },
      ],
    },

    {
      id: 'summary-info',
      title: t('masterBmhp:section.summary'),
      fields: [
        {
          id: 'total_sample',
          label: t('masterBmhp:label.total_sample'),
          value: data?.summary?.total_sample?.toString() || '-',
        },
        {
          id: 'total_test',
          label: t('masterBmhp:label.total_test'),
          value: data?.summary?.total_test?.toString() || '-',
        },
        {
          id: 'target_count',
          label: t('masterBmhp:label.target_count'),
          value: data?.summary?.target_count?.toString() || '-',
        },
        {
          id: 'material_count',
          label: t('masterBmhp:label.material_count'),
          value: data?.summary?.material_count?.toString() || '-',
        },
      ],
    },

    ...(data?.targets && data.targets.length > 0
      ? data.targets.map(
          (target) =>
            ({
              id: `target-${target.id}`,
              title: target.target_name,
              fields: [
                {
                  id: `sample_count-${target.id}`,
                  label: t('masterBmhp:label.sample_count'),
                  value: target.sample_count?.toString() || '-',
                },
                {
                  id: `test_count-${target.id}`,
                  label: t('masterBmhp:label.test_count'),
                  value: target.test_count?.toString() || '-',
                },
              ],
              listFields: [
                {
                  id: `materials-table-${target.id}`,
                  label: t('masterBmhp:label.materials'),
                  items: target.materials ?? [],
                  columns: materialColumns,
                  emptyText: t('masterBmhp:message.no_materials'),
                  tableClassName: 'ui-shadow-sm',
                },
              ],
            }) as DetailSectionProps
        )
      : []),

    {
      id: 'log-info',
      title: t('masterBmhp:section.log_info'),
      fields: [
        {
          id: 'created_at',
          label: t('masterBmhp:label.created_at'),
          value: data?.created_at
            ? dayjs(data.created_at).format('DD-MM-YYYY HH:mm:ss')
            : '-',
        },
        {
          id: 'updated_at',
          label: t('masterBmhp:label.updated_at'),
          value: data?.updated_at
            ? dayjs(data.updated_at).format('DD-MM-YYYY HH:mm:ss')
            : '-',
        },
        {
          id: 'updated_by',
          label: t('masterBmhp:label.updated_by'),
          value: data?.updated_by || '-',
        },
      ],
    },
  ]

  const actionButtons: MasterDetailActionButton[] = [
    {
      id: 'btn-delete',
      label: t('common:delete'),
      onClick: () => setShowDeleteModal(true),
      variant: 'outline',
      color: 'danger',
    },
  ]

  return (
    <>
      <MasterDetailPage
        title={t('masterBmhp:title.bmhp_history_detail')}
        backPath={basePath}
        sections={sections}
        isLoading={isLoading}
        actionButtons={actionButtons}
      />
      <ModalConfirmation
        isLoading={deleteMutation.isPending}
        open={showDeleteModal}
        onSubmit={handleDelete}
        setOpen={() => setShowDeleteModal(false)}
        title={t('masterBmhp:label.delete')}
        description={t('masterBmhp:message.delete')}
      />
    </>
  )
}

export default BmhpHistoryDetailPage
