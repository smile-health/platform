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
import { useBmhpPlanningDetailData } from '../../bmhp-planning/list/hooks/useBmhpPlanningDetailData'

import { deleteBmhpPemeriksaan } from '../list/master.service'
import { getBmhpPemeriksaanDetail } from './master.service'

const BmhpPemeriksaanDetailPage = () => {
  const { t } = useTranslation(['masterBmhp', 'common'])
  const params = useParams()
  const router = useSmileRouter()
  const { year_id } = router.query
  const basePath = `/v5/bmhp-planning/${year_id}/master-pemeriksaan/`
  const id = params?.id as string
  const { detailYearData } = useBmhpPlanningDetailData()
  const isFinal = !!detailYearData?.is_final

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['bmhp-pemeriksaan-detail', id],
    queryFn: () => getBmhpPemeriksaanDetail(id),
    enabled: Boolean(id),
  })

  const deleteMutation = useMutation({
    mutationFn: async (pemeriksaanId: number) => {
      return await deleteBmhpPemeriksaan(pemeriksaanId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bmhp-pemeriksaan-list'] })
      router.push(basePath)
    },
  })

  const handleDelete = async () => {
    if (id) {
      await deleteMutation.mutateAsync(Number(id))
      setShowDeleteModal(false)
    }
  }

  // Define target group columns for table
  const targetGroupColumns: ColumnDef<{
    id: number
    name: string
    code: string
    age_range: string
  }>[] = [
    {
      id: 'no',
      header: t('masterBmhp:table.column.no'),
      size: 80,
      cell: ({ row }) => row.index + 1,
    },
    {
      id: 'name',
      header: t('masterBmhp:label.name'),
      accessorKey: 'name',
    },
  ]

  // Define sections - simple configuration
  const sections: DetailSectionProps[] = [
    {
      id: 'detail-info',
      title: t('masterBmhp:section.detail_info'),
      fields: [
        {
          id: 'name',
          label: t('masterBmhp:label.name'),
          value: data?.name || '-',
        },
        {
          id: 'examination_type',
          label: t('masterBmhp:label.examination_type'),
          value: data?.examination_type_name || '-',
        },
        {
          id: 'description',
          label: t('masterBmhp:label.description'),
          value: data?.description || '-',
        },
        {
          id: 'is_active',
          label: t('masterBmhp:label.status'),
          value:
            data?.is_active === 1
              ? t('masterBmhp:common.active')
              : t('masterBmhp:common.inactive'),
        },
        {
          id: 'parameters',
          label: t('masterBmhp:label.parameter'),
          value:
            data?.parameters && data.parameters.length > 0
              ? data.parameters.map((p) => p.name).join(', ')
              : t('masterBmhp:message.examination'),
        },
        {
          id: 'methods',
          label: t('masterBmhp:label.method'),
          value:
            data?.methods && data.methods.length > 0
              ? data.methods.map((m) => m.name).join(', ')
              : t('masterBmhp:message.examination'),
        },
      ],
    },
    // Material sections - dynamically generated
    ...(data?.materials && data.materials.length > 0
      ? data.materials.map((material, index) => {
          // Filter target groups based on material's target_group_ids
          const materialTargetGroups =
            data.target_groups?.filter((tg) =>
              material.target_group_ids?.includes(tg.id)
            ) || []

          return {
            id: `material-info-${index + 1}`,
            title: material?.material_name,
            fields: [],
            listFields: [
              {
                id: 'target-groups-table',
                label: t('masterBmhp:label.target_group'),
                items: materialTargetGroups,
                columns: targetGroupColumns,
                emptyText: t('masterBmhp:message.examination'),
                tableClassName: 'ui-shadow-sm',
              },
            ],
          } as DetailSectionProps
        })
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
          id: 'created_by',
          label: t('common:created_by'),
          value: data?.created_by || '-',
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

  const actionButtons: MasterDetailActionButton[] = isFinal ? [] : [
    {
      id: 'btn-edit',
      label: t('common:edit'),
      href: `${basePath}/${id}/update`,
      variant: 'outline',
    },
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
        title={t('masterBmhp:title.bmhp_pemeriksaan_detail')}
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

export default BmhpPemeriksaanDetailPage
