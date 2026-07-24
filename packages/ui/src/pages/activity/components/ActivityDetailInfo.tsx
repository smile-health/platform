import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '#components/button'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import useSmileRouter from '#hooks/useSmileRouter'
import { ActivityData } from '#types/activity'
import { isViewOnly } from '#utils/user'
import { useTranslation } from 'react-i18next'

import { generateDetail } from '../utils/helper'
import ActivitySkeleton from './ActivitySkeleton'

type ActivityDetailInfoProps = {
  data?: ActivityData
  isLoading?: boolean
  onChangeStatus: () => void
  isLoadingUpdateStatus?: boolean
  pathEdit?: string
}

function ActivityDetailInfo(props: Readonly<ActivityDetailInfoProps>) {
  const { onChangeStatus, isLoading, isLoadingUpdateStatus, data, pathEdit } =
    props
  const { t } = useTranslation(['activity', 'common'])
  const router = useSmileRouter()
  const [openModalStatus, setOpenModalStatus] = useState(false)
  const detail = generateDetail(t, data)

  const statusDescription = t('activity:action.status.confirmation', {
    returnObjects: true,
  })

  if (isLoading) return <ActivitySkeleton />
  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <ModalConfirmation
        open={openModalStatus}
        setOpen={setOpenModalStatus}
        description={data?.status ? statusDescription[1] : statusDescription[0]}
        subDescription={
          data?.status ? t('activity:action.status.description') : undefined
        }
        onSubmit={() => onChangeStatus()}
        type="delete"
      />
      <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
        <h5 className="ui-font-bold">Details</h5>
        {!isViewOnly() && (
          <div className="ui-grid ui-grid-cols-2 ui-w-[250px] ui-justify-end ui-gap-2">
            <Button
              id="btn-program-activation"
              loading={isLoadingUpdateStatus}
              disabled={isLoadingUpdateStatus}
              onClick={() => setOpenModalStatus(true)}
              color={data?.status ? 'danger' : 'success'}
              variant="outline"
              className="ui-w-full"
            >
              {data?.status
                ? t('common:status.deactivate')
                : t('common:status.activate')}
            </Button>
            <Button id="btn-link-activity-edit" variant="outline" asChild>
              <Link
                href={
                  pathEdit ?? router.getAsLink(`/v5/activity/${data?.id}/edit`)
                }
              >
                {t('common:edit')}
              </Link>
            </Button>
          </div>
        )}
      </div>
      <RenderDetailValue data={detail} />
    </div>
  )
}

export default ActivityDetailInfo
