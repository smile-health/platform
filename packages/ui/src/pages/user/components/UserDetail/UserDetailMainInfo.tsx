import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '#components/button'
import ActiveLabel from '#components/modules/ActiveLabel'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import useChangeStatus from '#hooks/useChangeStatus'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { CommonType } from '#types/common'
import { useTranslation } from 'react-i18next'

import { updateStatusUserInProgram } from '../../user.service'
import { TDetailUserData } from '../../user.types'
import UserSkeleton from '../UserSkeleton'

type UserDetailMainInfoProps = CommonType &
  Pick<TDetailUserData, 'id' | 'status'> & {
    detail: TDetailUserData['main']
    isLoading?: boolean
  }

export default function UserDetailMainInfo(props: UserDetailMainInfoProps) {
  const { isLoading, id, status, detail, isGlobal } = props
  const { t } = useTranslation(['common', 'user'])
  const router = useSmileRouter()
  const queryClient = useQueryClient()

  const {
    onChangeStatus,
    isLoading: isLoadingUpdateStatus,
    changeStatusState,
    setChangeStatusState,
    handleResetChangeStatusState,
  } = useChangeStatus({
    titlePage: t('user:title.status'),
    validateQueryKey: 'user-detail',
    queryFn: updateStatusUserInProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['profile'],
      })
    },
  })

  if (isLoading) {
    return <UserSkeleton />
  }

  let editUrl = router.getAsLink(`/v5/user/${id}/edit`)
  if (isGlobal) {
    editUrl = router.getAsLinkGlobal(`/v5/global-settings/user/${id}/edit`)
  }

  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <ModalConfirmation
        open={changeStatusState?.show}
        setOpen={handleResetChangeStatusState}
        type={changeStatusState?.status ? 'delete' : 'update'}
        description={
          changeStatusState?.status
            ? t('user:confirmation.deactivate.question')
            : t('user:confirmation.activate.question')
        }
        subDescription={
          changeStatusState?.status
            ? t('user:confirmation.deactivate.description')
            : ''
        }
        onSubmit={onChangeStatus}
      />
      <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
        <h5 className="ui-font-bold">Details</h5>
        {isGlobal && (
          <Button
            asChild
            data-testid="btn-link-user-edit"
            className="ui-w-28"
            variant="outline"
          >
            <Link href={editUrl}>{t('common:edit')}</Link>
          </Button>
        )}
        {!isGlobal && hasPermission('user-change-status') && (
          <Button
            data-testid="btn-user-activation"
            loading={isLoadingUpdateStatus}
            disabled={isLoadingUpdateStatus}
            variant="outline"
            color={status ? 'danger' : 'success'}
            className="ui-w-28"
            onClick={() => {
              setChangeStatusState({
                show: true,
                id,
                status,
              })
            }}
          >
            {status ? t('status.deactivate') : t('status.activate')}
          </Button>
        )}
      </div>
      {!isGlobal && hasPermission('user-change-status') && (
        <ActiveLabel isActive={!!status} />
      )}
      <RenderDetailValue data={detail} />
    </div>
  )
}
