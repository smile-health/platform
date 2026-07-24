import Link from 'next/link'
import { Button } from '#components/button'
import { Exists } from '#components/exists'
import ActiveLabel from '#components/modules/ActiveLabel'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import useChangeStatus from '#hooks/useChangeStatus'
import { hasPermission } from '#shared/permission/index'
import { CommonType } from '#types/common'
import { TManufacturer } from '#types/manufacturer'
import { useTranslation } from 'react-i18next'

import { generateManufacturerDetail } from '../../manufacturer.helper'
import { updateStatusManufacturerInProgram } from '../../manufacturer.service'
import ManufacturerLoading from '../ManufacturerLoading'

type UserDetailMainInfoProps = CommonType & {
  data?: TManufacturer
  isLoading?: boolean
}

export default function ManufacturerDetaiInfo(props: UserDetailMainInfoProps) {
  const { isLoading, data, isGlobal } = props
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'manufacturer'])

  const {
    onChangeStatus,
    isLoading: isLoadingUpdateStatus,
    changeStatusState,
    setChangeStatusState,
    handleResetChangeStatusState,
  } = useChangeStatus({
    titlePage: t('manufacturer:title.status')?.toLowerCase(),
    validateQueryKey: 'manufacturer-detail',
    queryFn: updateStatusManufacturerInProgram,
  })

  if (isLoading) {
    return <ManufacturerLoading />
  }

  const status = data?.status
  const detail = generateManufacturerDetail(t, data)

  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <ModalConfirmation
        open={changeStatusState?.show}
        setOpen={handleResetChangeStatusState}
        description={
          status
            ? t('manufacturer:action.deactivate.confirmation')
            : t('manufacturer:action.activate.confirmation')
        }
        onSubmit={onChangeStatus}
      />
      <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
        <h5 className="ui-font-bold">Details</h5>
        <div className="ui-grid ui-grid-cols-1 ui-w-[150px] ui-justify-end">
          <Exists
            useIt={!isGlobal && hasPermission('manufacturer-change-status')}
          >
            <Button
              data-testid="btn-manufacturer-activation"
              loading={isLoadingUpdateStatus}
              disabled={isLoadingUpdateStatus}
              variant="outline"
              color={status ? 'danger' : 'success'}
              onClick={() => {
                setChangeStatusState({
                  show: true,
                  id: data?.id,
                  status,
                })
              }}
            >
              {status ? t('status.deactivate') : t('status.activate')}
            </Button>
          </Exists>
          <Exists useIt={isGlobal ?? false}>
            <Button
              asChild
              data-testid="btn-link-manufacturer-edit"
              variant="outline"
            >
              <Link
                href={`/${language}/v5/global-settings/manufacturer/${data?.id}/edit`}
              >
                {t('common:edit')}
              </Link>
            </Button>
          </Exists>
        </div>
      </div>
      {!isGlobal && <ActiveLabel isActive={!!status} />}
      <RenderDetailValue data={detail} />
    </div>
  )
}
