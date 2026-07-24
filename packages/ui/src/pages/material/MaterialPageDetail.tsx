'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '#components/button'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { toast } from '#components/toast'
import { STATUS } from '#constants/common'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import cx from '#lib/cx'
import Error403Page from '#pages/error/Error403Page'
import Error404Page from '#pages/error/Error404Page'
import {
  getMaterialDetail,
  MaterialDetailGlobalResponse,
  MaterialDetailProgramResponse,
  updateMaterialStatus,
} from '#services/material'
import { hasPermission } from '#shared/permission/index'
import { CommonType, ErrorResponse } from '#types/common'
import { isViewOnly } from '#utils/user'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import MaterialDetailInfoGlobal from './components/MaterialDetailInfoGlobal'
import MaterialDetailInfoProgram from './components/MaterialDetailInfoProgram'
import MaterialDetailProgramList from './components/MaterialDetailProgramList'
import MaterialDetailSkeleton from './components/Skeleton/MaterialDetailSkeleton'

const MaterialPageDetail: React.FC<CommonType> = ({ isGlobal = false }) => {
  usePermission(isGlobal ? 'material-global-view' : 'material-view')
  const params = useParams()
  const { getAsLink, getAsLinkGlobal, back } = useSmileRouter()
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'material'])

  const materialId = params?.id as string
  const editRoute = isGlobal
    ? getAsLinkGlobal(`/v5/global-settings/material/data/${materialId}/edit`)
    : getAsLink(`/v5/material/${materialId}/edit`)

  const [showActivation, setShowActivation] = useState(false)

  const { data, isLoading, error, refetch } = useQuery<
    MaterialDetailGlobalResponse | MaterialDetailProgramResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ['material', materialId, language],
    queryFn: () => getMaterialDetail(materialId, isGlobal),
    enabled: Boolean(materialId),
    retry: false,
  })

  const { mutate: onChangeStatus } = useMutation({
    mutationFn: (id: string | number) =>
      updateMaterialStatus(
        id,
        {
          status: data?.status ? STATUS.INACTIVE : STATUS.ACTIVE,
        },
        isGlobal
      ),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.update_status', {
          type: 'material',
        }),
      })
      refetch()
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.danger({
        description: error.response?.data.message,
      })
    },
  })

  useSetLoadingPopupStore(isLoading)

  if (error?.response?.status === 403) return <Error403Page />
  if (error?.response?.status === 404) return <Error404Page />
  if (error?.response?.status === 422) return <Error404Page />

  return (
    <AppLayout
      title={t('material:detail.title')}
      backButton={{
        label: t('common:back_to_list'),
        show: true,
        onClick: () => {
          back()
        },
      }}
    >
      <Meta title={`SMILE | Material`} />

      {!error && (
        <>
          <ModalConfirmation
            open={showActivation}
            description={
              data?.status
                ? t('material:action.deactivate.confirmation')
                : t('material:action.activate.confirmation')
            }
            setOpen={(open) => setShowActivation(open)}
            onSubmit={() => onChangeStatus(materialId?.toString())}
          />
          <div className="ui-space-y-6">
            <div className="ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
              <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
                <h5 className="ui-font-bold ui-text-dark-blue">Details</h5>

                {!isLoading && data && (
                  <div
                    className={cx(
                      'ui-grid ui-justify-end ui-gap-2',
                      isGlobal
                        ? 'ui-w-[150px] ui-grid-cols-1'
                        : 'ui-w-[250px] ui-grid-cols-2'
                    )}
                  >
                    {!isGlobal && (
                      <>
                        {hasPermission('material-mutate') && (
                          <Button
                            id="btnDeactivateMaterial"
                            color={data?.status ? 'danger' : 'success'}
                            variant="outline"
                            onClick={() => setShowActivation(true)}
                          >
                            {data?.status
                              ? t('material:action.deactivate.button')
                              : t('material:action.activate.button')}
                          </Button>
                        )}
                      </>
                    )}

                    {!isViewOnly() && (
                      <Button id="btnEditMaterial" variant="outline" asChild>
                        <Link href={editRoute}>{t('common:edit')}</Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {(isLoading || !data) && <MaterialDetailSkeleton />}

              {!isLoading && data && isGlobal && (
                <MaterialDetailInfoGlobal
                  id={materialId}
                  data={data as MaterialDetailGlobalResponse}
                />
              )}

              {!isLoading && data && !isGlobal && (
                <MaterialDetailInfoProgram
                  data={data as MaterialDetailProgramResponse}
                />
              )}
            </div>

            {isGlobal && (
              <MaterialDetailProgramList
                data={data as MaterialDetailGlobalResponse}
              />
            )}
          </div>
        </>
      )}
    </AppLayout>
  )
}

export default MaterialPageDetail
