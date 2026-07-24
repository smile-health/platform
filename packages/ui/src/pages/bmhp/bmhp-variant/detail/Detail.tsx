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

import { deleteBmhpVariant } from '../list/master.service'
import { getBmhpVariantDetail } from './master.service'

const BmhpVariantDetailPage = () => {
  const { t } = useTranslation(['masterBmhp', 'common'])
  const params = useParams()
  const router = useSmileRouter()
  const { year_id } = router.query
  const basePath = `/v5/bmhp-planning/${year_id}/variant/`
  const id = params?.id as string
  const { detailYearData } = useBmhpPlanningDetailData()
  const isFinal = !!detailYearData?.is_final

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['bmhp-variant-detail', id],
    queryFn: () => getBmhpVariantDetail(id),
    enabled: Boolean(id),
  })

  const deleteMutation = useMutation({
    mutationFn: async (variantId: number) => {
      return await deleteBmhpVariant(variantId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bmhp-variant-list'] })
      router.push(basePath)
    },
  })

  const handleDelete = async () => {
    if (id) {
      await deleteMutation.mutateAsync(Number(id))
      setShowDeleteModal(false)
    }
  }

  const materialDetails: ColumnDef<{
    id: number
    name: string
    test_qty: number
    unit_id: number
    unit_name: string
  }>[] = [
      {
        id: 'id',
        header: t('masterBmhp:table.column.no'),
        accessorKey: 'id',
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
      },
      {
        id: 'unit_id',
        header: t('masterBmhp:label.unit'),
        accessorKey: 'unit_name',
      },
    ]

  // Define sections - simple configuration
  const sections: DetailSectionProps[] = [
    {
      id: 'detail-info',
      title: t('masterBmhp:section.detail_info'),
      fields: [
        {
          id: 'material_name',
          label: t('masterBmhp:label.material'),
          value: data?.material_name || '-',
        },
      ],
    },
    {
      id: 'variants-info',
      title: t('masterBmhp:section.variants'),
      fields: [],
      listFields: [
        {
          id: 'material-table',
          label: '',
          items: data?.variants || [],
          columns: materialDetails,
          emptyText: t('masterBmhp:message.material'),
          tableClassName: 'ui-shadow-sm', // Optional styling
        },
      ],
    },
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
        title={t('masterBmhp:title.bmhp_variant_detail')}
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

export default BmhpVariantDetailPage
