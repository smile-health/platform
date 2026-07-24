import React, { useContext, useState } from 'react'
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
import BmhpPlanningDetailContext from '../../bmhp-planning/list/libs/bmhp-planning-list.context'

import { deleteBmhpTargetGroup } from '../list/master.service'
import { Examination, getBmhpMaterialDetail } from './master.service'

const BmhpTargetGroupDetailPage = () => {
  const { t } = useTranslation(['masterBmhp', 'common'])
  const params = useParams()
  const router = useSmileRouter()
  const basePath = '/v5/bmhp/bmhp-target-groups'
  const id = params?.id as string
  const { yearData } = useContext(BmhpPlanningDetailContext)
  const isFinal = !!yearData?.is_final

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['bmhp-target-group-detail', id],
    queryFn: () => getBmhpMaterialDetail(id),
    enabled: Boolean(id),
  })

  const deleteMutation = useMutation({
    mutationFn: async (targetGroupId: number) => {
      return await deleteBmhpTargetGroup(targetGroupId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bmhp-material-list'] })
      router.pushGlobal(basePath)
    },
  })

  const handleDelete = async () => {
    if (id) {
      await deleteMutation.mutateAsync(Number(id))
      setShowDeleteModal(false)
    }
  }
  const examinationColumns: ColumnDef<Examination>[] = [
    {
      id: 'id',
      header: t('masterBmhp:table.column.no'),
      accessorKey: 'id',
      size: 80,
      cell: ({ row }) => {
        return (
          <span className="ui-text-sm ui-font-medium">{row.index + 1}</span>
        )
      },
    },
    {
      id: 'name',
      header: t('masterBmhp:label.examination_name'),
      accessorKey: 'name',
    },
    {
      id: 'description',
      header: t('masterBmhp:label.description'),
      accessorKey: 'description',
    },
    {
      id: 'is_active',
      header: t('masterBmhp:label.status'),
      accessorKey: 'is_active',
      size: 100,
      cell: ({ getValue }) => {
        const isActive = getValue() === 1
        return (
          <span
            className={`ui-text-xs ui-px-2 ui-py-1 ui-rounded ui-font-medium ${isActive
              ? 'ui-bg-green-100 ui-text-green-800'
              : 'ui-bg-red-100 ui-text-red-800'
              }`}
          >
            {isActive
              ? t('masterBmhp:common.active')
              : t('masterBmhp:common.inactive')}
          </span>
        )
      },
    },
    {
      id: 'created_at',
      header: t('masterBmhp:label.created_at'),
      accessorKey: 'created_at',
      size: 140,
      cell: ({ getValue }) => (
        <span className="ui-text-xs ui-text-gray-500">
          {dayjs(getValue() as string).format('DD MMM YYYY, HH:mm')}
        </span>
      ),
    },
  ]

  // Define sections - simple configuration
  const sections: DetailSectionProps[] = [
    {
      id: 'detail-info',
      title: t('masterBmhp:section.detail_info'),
      fields: [
        {
          id: 'code',
          label: t('masterBmhp:label.code'),
          value: data?.code ?? '-',
        },
        {
          id: 'name',
          label: t('masterBmhp:label.name'),
          value: data?.name ?? '-',
        },
        {
          id: 'description',
          label: t('masterBmhp:label.description'),
          value: data?.description ?? '-',
        },
        {
          id: 'age_range',
          label: t('masterBmhp:label.age_range'),
          value: data?.age_range ?? '-',
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
    {
      id: 'main-info',
      title: t('masterBmhp:label.examination'),
      fields: [],
      listFields: [
        {
          id: 'examinations-table',
          label: '',
          items: data?.examinations || [],
          columns: examinationColumns,
          emptyText: t('masterBmhp:message.examination'),
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
        title={t('masterBmhp:title.bmhp_material_target_group_detail')}
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

export default BmhpTargetGroupDetailPage
