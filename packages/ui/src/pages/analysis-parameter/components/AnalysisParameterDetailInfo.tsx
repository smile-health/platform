'use client'

import Link from 'next/link'
import { Button } from '#components/button'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import useSmileRouter from '#hooks/useSmileRouter'
import { isViewOnly } from '#utils/user'
import { useTranslation } from 'react-i18next'

import { AnalysisParameterResponse } from '../analysis-parameter.type'
import AnalysisParameterSkeleton from './AnalysisParameterSkeleton'

type AnalysisParameterDetailInfoProps = {
  data?: AnalysisParameterResponse
  isLoading?: boolean
}

function AnalysisParameterDetailInfo(props: Readonly<AnalysisParameterDetailInfoProps>) {
  const { isLoading, data } = props
  const { t } = useTranslation(['common', 'analysisParameter'])
  const router = useSmileRouter()

  const detailData = [
    {
      label: t('analysisParameter:form.name.label'),
      value: data?.name ?? '-',
    },
    {
      label: t('analysisParameter:form.unit.label'),
      value: data?.unit ?? '-',
    },
  ]

  if (isLoading) return <AnalysisParameterSkeleton />

  return (
    <div className="ui-mt-6">
      <div className="ui-max-w-form ui-mx-auto ui-p-4 ui-border ui-border-gray-300 ui-rounded ui-bg-white">
        <div className="ui-flex ui-justify-between ui-items-start ui-gap-4 ui-mb-6">
          <div className="ui-font-bold">
            {t('analysisParameter:form.detail_title')}
          </div>
          {!isViewOnly() && (
            <Button id="btn-link-edit" variant="outline" asChild size="sm">
              <Link
                href={router.getAsLink(
                  `/v5/analysis-parameter/${data?.id}/edit`
                )}
              >
                {t('common:edit')}
              </Link>
            </Button>
          )}
        </div>
        <div className="ui-mt-4">
          <RenderDetailValue data={detailData} />
        </div>
      </div>
    </div>
  )
}

export default AnalysisParameterDetailInfo
