import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import useSmileRouter from '#hooks/useSmileRouter'
import { DetailSectionProps } from '#pages/bmhp/master/detail/components/DetailSection'
import MasterDetailPage, {
  MasterDetailActionButton,
} from '#pages/bmhp/master/detail/MasterDetailPage'
import { queryClient } from '#provider/query-client'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { deleteBmhpMethod } from '../list/master.service'
import { getBmhpMethodDetail } from './master.service'

const BmhpMethodDetailPage = () => {
  const { t } = useTranslation(['masterBmhp', 'common'])
  const params = useParams()
  const router = useSmileRouter()
  const { year_id } = router.query
  const basePath = `/v5/bmhp-planning/${year_id}/method`
  const id = params?.id as string

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['bmhp-method-detail', id],
    queryFn: () => getBmhpMethodDetail(id),
    enabled: Boolean(id),
  })

  const deleteMutation = useMutation({
    mutationFn: async (methodId: number) => {
      return await deleteBmhpMethod(methodId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bmhp-method-list'] })
      router.push(basePath)
    },
  })

  const handleDelete = async () => {
    if (id) {
      await deleteMutation.mutateAsync(Number(id))
      setShowDeleteModal(false)
    }
  }

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

  // Define action buttons
  const actionButtons: MasterDetailActionButton[] = [
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
        title={t('masterBmhp:title.bmhp_method_detail')}
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

export default BmhpMethodDetailPage
