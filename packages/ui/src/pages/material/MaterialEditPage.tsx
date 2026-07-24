'use client'

import { Fragment } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import Error403Page from '#pages/error/Error403Page'
import Error404Page from '#pages/error/Error404Page'
import {
  getMaterialDetail,
  GetMaterialRelation,
  getMaterialRelations,
  MaterialDetailGlobalResponse,
  MaterialDetailProgramResponse,
} from '#services/material'
import { ErrorResponse } from '#types/common'
import { generateMetaTitle } from '#utils/strings'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import MaterialFormGlobal from './components/MaterialFormGlobal'
import MaterialFormProgram from './components/MaterialFormProgram'
import MaterialSkeleton from './components/MaterialSkeleton'

export type MaterialEditPageProps = {
  isGlobal?: boolean
}

const MaterialEditPage = ({
  isGlobal = false,
}: MaterialEditPageProps): JSX.Element => {
  usePermission(isGlobal ? 'material-global-mutate' : 'material-mutate')
  const {
    t,
    i18n: { language },
  } = useTranslation(['material', 'common'])
  const params = useParams()
  const router = useSmileRouter()

  const { data, isLoading, error } = useQuery<
    MaterialDetailGlobalResponse | MaterialDetailProgramResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ['material', params?.id, language],
    queryFn: () => getMaterialDetail(Number(params?.id), isGlobal),
    enabled: Boolean(params?.id),
  })

  const { data: materialRelation, isLoading: isMaterialRelationLoading } =
    useQuery({
      queryKey: ['material-relation', params?.id, language],
      queryFn: () => getMaterialRelations(Number(params?.id)),
      enabled: Boolean(params?.id) && isGlobal,
    })

  useSetLoadingPopupStore(isLoading || isMaterialRelationLoading)

  if (error?.response?.status === 403) return <Error403Page />
  if (error?.response?.status === 404) return <Error404Page />
  if (error?.response?.status === 422) return <Error404Page />

  return (
    <AppLayout
      title={t('title.edit')}
      backButton={{
        label: t('common:back_to_list'),
        show: true,
        onClick: () => {
          router.back()
        },
      }}
    >
      <Meta
        title={generateMetaTitle(
          isGlobal ? 'Global Material' : 'Material',
          true
        )}
      />
      <div className="mt-6 space-y-6">
        {isLoading || isMaterialRelationLoading ? (
          <MaterialSkeleton />
        ) : (
          <Fragment>
            {isGlobal ? (
              <MaterialFormGlobal
                isGlobal={true}
                defaultValues={data as MaterialDetailGlobalResponse}
                materialRelation={materialRelation as GetMaterialRelation}
              />
            ) : (
              <MaterialFormProgram
                defaultValues={data as MaterialDetailProgramResponse}
                materialRelation={materialRelation as GetMaterialRelation}
              />
            )}
          </Fragment>
        )}
      </div>
    </AppLayout>
  )
}

export default MaterialEditPage
