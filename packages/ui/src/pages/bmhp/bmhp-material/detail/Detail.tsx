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

import { deleteBmhpMaterial } from '../list/master.service'
import {
  BmhpMaterialVariantDetailItem,
  getBmhpMaterialDetail,
} from './master.service'

const BmhpMaterialDetailPage = () => {
  const { t } = useTranslation(['masterBmhp', 'common'])
  const params = useParams()
  const router = useSmileRouter()
  const { year_id } = router.query
  const basePath = `/v5/bmhp-planning/${year_id}/material`
  const id = params?.id as string
  const { detailYearData } = useBmhpPlanningDetailData()
  const isFinal = !!detailYearData?.is_final

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['bmhp-material-detail', id],
    queryFn: () => getBmhpMaterialDetail(id),
    enabled: Boolean(id),
  })

  const deleteMutation = useMutation({
    mutationFn: async (materialId: number) => {
      return await deleteBmhpMaterial(materialId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bmhp-material-list'] })
      router.push(basePath)
    },
  })

  const handleDelete = async () => {
    if (id) {
      await deleteMutation.mutateAsync(Number(id))
      setShowDeleteModal(false)
    }
  }

  const variantColumns: ColumnDef<BmhpMaterialVariantDetailItem>[] = [
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
    {
      id: 'test_qty',
      header: t('masterBmhp:label.test_qty'),
      accessorKey: 'test_qty',
      size: 100,
    },
    {
      id: 'unit_name',
      header: t('masterBmhp:label.unit'),
      accessorKey: 'unit_name',
      size: 120,
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
      ],
    },
    // Dynamically create sections for each material with its variants
    ...(data?.material_details || []).map((material) => ({
      id: `material-${material.id}`,
      title: material.name,
      fields: [],
      listFields: [
        {
          id: `variant-table-${material.id}`,
          label: '',
          items:
            data?.material_variant_details?.filter(
              (variant) => variant.material_variant_id === material.id
            ) || [],
          columns: variantColumns,
          emptyText: t('masterBmhp:message.material'),
          tableClassName: 'ui-shadow-sm',
        },
      ],
    })),
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
        title={t('masterBmhp:title.bmhp_material_detail')}
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

export default BmhpMaterialDetailPage
