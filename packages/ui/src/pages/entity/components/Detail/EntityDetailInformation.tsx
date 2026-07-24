import { Fragment, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '#components/button'
import { ButtonIcon } from '#components/button-icon'
import Pencil from '#components/icons/Pencil'
import XMark from '#components/icons/XMark'
import ActiveLabel from '#components/modules/ActiveLabel'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { SingleValue } from '#components/modules/RenderDetailValue'
import { Switch } from '#components/switch'
import { toast } from '#components/toast'
import useChangeStatus from '#hooks/useChangeStatus'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { updateStatusEntity, updateStatusEntityVendor } from '#services/entity'
import { hasPermission } from '#shared/permission/index'
import { CommonType } from '#types/common'
import { TDetailEntity } from '#types/entity'
import { isViewOnly } from '#utils/user'
import { Trans, useTranslation } from 'react-i18next'

import { generateEntityDetail } from '../../utils/helper'

type Props = CommonType & {
  entity: TDetailEntity | undefined
}

const EntityDetailInformation: React.FC<Props> = (props) => {
  const { entity, isGlobal } = props
  const queryClient = useQueryClient()
  const [isEdit, setIsEdit] = useState(false)
  const [isEditRelocation, setIsEditRelocation] = useState(false)
  const [entityFlag, setEntityFlag] = useState<{
    is_vendor: boolean
    is_relocation: boolean
  }>({ is_vendor: !!entity?.is_vendor, is_relocation: !!entity?.is_relocation })
  const [modalRelocation, setModalRelocation] = useState(false)
  const { i18n, t } = useTranslation(['common', 'entity'])
  const router = useRouter()

  const details = generateEntityDetail(
    t,
    entity,
    isGlobal,
    entity?.location ?? '-'
  )

  const {
    onChangeStatus,
    isLoading: isLoadingUpdateStatus,
    changeStatusState,
    setChangeStatusState,
    handleResetChangeStatusState,
  } = useChangeStatus({
    titlePage: 'status entity',
    validateQueryKey: 'getEntityDetail',
    queryFn: (id, status) => updateStatusEntity(id, { status: String(status) }),
  })

  const setStatusRelocation = (
    isVendor: boolean,
    isRelocation: boolean
  ): string => {
    if (isVendor) return isRelocation ? '1' : '0'

    return '0'
  }

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      updateStatusEntityVendor(String(entity?.id), {
        status: entityFlag.is_vendor ? '1' : '0',
        is_relocation: setStatusRelocation(
          entityFlag.is_vendor,
          entityFlag.is_relocation
        ),
      }),
    onError: (res) => toast.danger({ description: res.message }),
    onSuccess: async () => {
      toast.success({ description: t('entity:form.success.update') })
      await queryClient.invalidateQueries({ queryKey: ['getEntityDetail'] })
      if (isEdit) setIsEdit(false)
      if (isEditRelocation) setIsEditRelocation(false)
    },
  })

  useEffect(() => {
    if (entity?.id) {
      setEntityFlag({
        is_vendor: !!entity.is_vendor,
        is_relocation: !!entity.is_relocation,
      })
    }
  }, [entity])

  const isLoadingPopup = isLoadingUpdateStatus || isPending
  useSetLoadingPopupStore(isLoadingPopup)

  const renderActiveLabel = () => {
    if (isGlobal) return null
    return <ActiveLabel isActive={!!entity?.status} />
  }

  const handleChangeVendor = () => {
    if (!entityFlag.is_vendor && entityFlag.is_relocation)
      return setModalRelocation(true)
    mutate()
  }

  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-gray-300 ui-rounded ui-space-y-4">
      <ModalConfirmation
        open={changeStatusState?.show}
        description={
          entity?.status
            ? t('entity:action.deactivate.confirmation')
            : t('entity:action.activate.confirmation')
        }
        setOpen={handleResetChangeStatusState}
        onSubmit={onChangeStatus}
      />
      <ModalConfirmation
        open={modalRelocation}
        title={t('entity:modal_relocation.title')}
        buttonTitle={t('entity:modal_relocation.submit')}
        description={
          <p className="ui-text-base ui-font-medium">
            <Trans t={t} i18nKey="entity:modal_relocation.description" />
          </p>
        }
        onSubmit={() => {
          setModalRelocation(false)
          mutate()
        }}
        setOpen={setModalRelocation}
      />
      <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
        <h5 className="ui-font-bold">{t('entity:detail.details.title')}</h5>
        {!isViewOnly() && (
          <div className="ui-grid ui-grid-cols-1 ui-w-[125px] ui-justify-end ui-gap-2">
            {isGlobal ? (
              <Button
                id="btn-link-entity-edit"
                variant="outline"
                onClick={() => {
                  let url = `/${i18n.language}/v5/entity/${entity?.id}/edit`
                  if (isGlobal) {
                    url = `/${i18n.language}/v5/global-settings/entity/${entity?.id}/edit`
                  }
                  router.push(url)
                }}
              >
                {t('common:edit')}
              </Button>
            ) : (
              <Button
                id="btn-entity-activation"
                loading={isLoadingUpdateStatus}
                disabled={isLoadingUpdateStatus}
                onClick={() =>
                  setChangeStatusState({
                    show: true,
                    id: entity?.id,
                    status: entity?.status,
                  })
                }
                color={entity?.status ? 'danger' : 'success'}
                variant="outline"
              >
                {entity?.status
                  ? t('entity:action.deactivate.button')
                  : t('entity:action.activate.button')}
              </Button>
            )}
          </div>
        )}
      </div>

      {renderActiveLabel()}
      <div className="ui-grid ui-grid-cols-[264px_3px_1fr] ui-gap-x-2 ui-gap-y-4">
        {details?.map(({ label, value, id }) => (
          <SingleValue
            id={id}
            key={id}
            label={label}
            value={value}
            skipEmptyValue
          />
        ))}
        {!isGlobal && (
          <Fragment>
            <p key="entity-vendor-status" className="ui-text-[#787878]">
              {t('entity:detail.additional.active_transaction')}
            </p>
            {!isEdit ? (
              <Fragment>
                <span>:</span>
                <div className="ui-flex ui-gap-6 ui-items-center">
                  <p>{t(`common:${entity?.is_vendor ? 'yes' : 'no'}`)}</p>
                  {hasPermission('entity-mutate') && (
                    <ButtonIcon
                      size="sm"
                      variant="subtle"
                      onClick={() => setIsEdit((prev) => !prev)}
                      disabled={isEditRelocation}
                    >
                      <Pencil />
                    </ButtonIcon>
                  )}
                </div>
              </Fragment>
            ) : (
              <Fragment>
                <div className="ui-flex ui-gap-6 ui-items-center">
                  <Switch
                    onCheckedChange={(is_vendor) =>
                      setEntityFlag((prev) => ({ ...prev, is_vendor }))
                    }
                    checked={entityFlag.is_vendor}
                    size="xl"
                    labelInside={{
                      on: t('common:yes'),
                      off: t('common:no'),
                    }}
                  />
                  <Button
                    variant="subtle"
                    className="ui-text-sm"
                    onClick={handleChangeVendor}
                  >
                    {t('common:save')}
                  </Button>
                  <ButtonIcon
                    size="sm"
                    color="danger"
                    variant="subtle"
                    onClick={() => {
                      setEntityFlag((prev) => ({
                        ...prev,
                        is_vendor: !!entity?.is_vendor,
                      }))
                      setIsEdit((prev) => !prev)
                    }}
                  >
                    <XMark />
                  </ButtonIcon>
                </div>
                <div className="ui-w-0" />
              </Fragment>
            )}

            <p key="entity-relocation-status" className="ui-text-[#787878]">
              {t('entity:detail.additional.relocation')}
            </p>
            {!isEditRelocation ? (
              <Fragment>
                <span>:</span>
                <div className="ui-flex ui-gap-6 ui-items-center">
                  <p>{t(`common:${entity?.is_relocation ? 'yes' : 'no'}`)}</p>
                  {hasPermission('entity-mutate') && (
                    <ButtonIcon
                      size="sm"
                      variant="subtle"
                      onClick={() => setIsEditRelocation((prev) => !prev)}
                      disabled={isEdit || !entity?.is_vendor}
                    >
                      <Pencil />
                    </ButtonIcon>
                  )}
                </div>
              </Fragment>
            ) : (
              <Fragment>
                <div className="ui-flex ui-gap-6 ui-items-center">
                  <Switch
                    onCheckedChange={(is_relocation) =>
                      setEntityFlag((prev) => ({ ...prev, is_relocation }))
                    }
                    checked={entityFlag.is_relocation}
                    size="xl"
                    labelInside={{
                      on: t('common:yes'),
                      off: t('common:no'),
                    }}
                  />
                  <Button
                    variant="subtle"
                    className="ui-text-sm"
                    onClick={() => mutate()}
                  >
                    {t('common:save')}
                  </Button>
                  <ButtonIcon
                    size="sm"
                    color="danger"
                    variant="subtle"
                    onClick={() => {
                      setEntityFlag((prev) => ({
                        ...prev,
                        is_relocation: !!entity?.is_relocation,
                      }))
                      setIsEditRelocation((prev) => !prev)
                    }}
                  >
                    <XMark />
                  </ButtonIcon>
                </div>
                <div className="ui-w-0" />
              </Fragment>
            )}
          </Fragment>
        )}
      </div>
    </div>
  )
}

export default EntityDetailInformation
