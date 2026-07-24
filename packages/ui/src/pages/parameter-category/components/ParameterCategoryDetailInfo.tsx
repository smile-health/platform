import React from 'react'
import Link from 'next/link'
import { Button } from '#components/button'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import useSmileRouter from '#hooks/useSmileRouter'
import { isViewOnly } from '#utils/user'
import { useTranslation } from 'react-i18next'

import { ParameterCategoryResponse } from '../parameter-category.type'
import ParameterCategorySkeleton from './ParameterCategorySkeleton'

type ParameterCategoryDetailInfoProps = {
  data?: ParameterCategoryResponse
  isLoading?: boolean
}

function ParameterCategoryDetailInfo(props: Readonly<ParameterCategoryDetailInfoProps>) {
  const { isLoading, data } = props
  const { t } = useTranslation(['parameterCategory', 'common'])
  const router = useSmileRouter()

  const detail = [
    {
      label: t('parameterCategory:form.name.label'),
      value: data?.name ?? '-',
    },
  ]

  if (isLoading) return <ParameterCategorySkeleton />
  return (
    <div className="ui-max-w-form ui-mx-auto ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4 ui-bg-white">
      <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
        <h5 className="ui-font-bold">{t('parameterCategory:form.detail_title')}</h5>
        {!isViewOnly() && (
          <Button id="btn-link-edit" variant="outline" asChild size="sm">
            <Link href={router.getAsLink(`/v5/parameter-category/${data?.id}/edit`)}>
              {t('common:edit')}
            </Link>
          </Button>
        )}
      </div>
      <RenderDetailValue data={detail} />

      <hr className="ui-my-4" />

      <div>
        <div className="ui-font-bold ui-mb-4">{t('parameterCategory:table.analysis_parameters')}</div>
        <div className="ui-space-y-3">
          {data?.analysis_parameters?.length === 0 ? (
            <div className="ui-text-gray-500 ui-text-center ui-py-4">
              {t('common:message.empty.description')}
            </div>
          ) : (
            data?.analysis_parameters?.map((item) => (
              <div key={item.id} className="ui-p-4 ui-bg-gray-50 ui-rounded ui-border ui-border-gray-200">
                <div className="ui-grid ui-grid-cols-1 md:ui-grid-cols-4 ui-gap-4">
                  <div>
                    <div className="ui-text-xs ui-text-gray-500 ui-uppercase ui-font-semibold ui-mb-1">
                      {t('parameterCategory:form.analysis_parameter.label')}
                    </div>
                    <div className="ui-font-medium">{item.parameter_name ?? '-'}</div>
                  </div>
                  <div>
                    <div className="ui-text-xs ui-text-gray-500 ui-uppercase ui-font-semibold ui-mb-1">
                      {t('parameterCategory:form.unit')}
                    </div>
                    <div className="ui-font-medium">{item.unit_name ?? '-'}</div>
                  </div>
                  <div>
                    <div className="ui-text-xs ui-text-gray-500 ui-uppercase ui-font-semibold ui-mb-1">
                      {t('parameterCategory:form.test_method.label')}
                    </div>
                    <div className="ui-font-medium">
                      {item.test_methods?.map((m: any) => m.name).join(', ') || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="ui-text-xs ui-text-gray-500 ui-uppercase ui-font-semibold ui-mb-1">
                      {t('parameterCategory:form.quality_standard')}
                    </div>
                    <div className="ui-font-medium">
                      {item.test_methods?.map((m: any) => m.quality_standard ?? '-').join(', ') || '-'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {data?.fields && data.fields.length > 0 && (
        <>
          <hr className="ui-my-4" />
          <div>
            <div className="ui-font-bold ui-mb-4">{t('parameterCategory:form.fields.title')}</div>
            <div className="ui-space-y-3">
              {data.fields.map((field) => (
                <div key={field.id} className="ui-p-4 ui-bg-gray-50 ui-rounded ui-border ui-border-gray-200">
                  <div className="ui-grid ui-grid-cols-2 md:ui-grid-cols-3 ui-gap-4">
                    <div>
                      <div className="ui-text-xs ui-text-gray-500 ui-uppercase ui-font-semibold ui-mb-1">
                        {t('parameterCategory:form.fields.label.label')}
                      </div>
                      <div className="ui-font-medium">{field.label}</div>
                    </div>
                    <div>
                      <div className="ui-text-xs ui-text-gray-500 ui-uppercase ui-font-semibold ui-mb-1">
                        {t('parameterCategory:form.fields.hint.label')}
                      </div>
                      <div className="ui-font-medium">{field.hint ?? '-'}</div>
                    </div>
                    <div>
                      <div className="ui-text-xs ui-text-gray-500 ui-uppercase ui-font-semibold ui-mb-1">
                        {t('parameterCategory:form.fields.type_data.label')}
                      </div>
                      <div className="ui-font-medium">{field.type_data}</div>
                    </div>
                  </div>
                  <div className="ui-mt-3">
                    <div className="ui-text-xs ui-text-gray-500 ui-uppercase ui-font-semibold ui-mb-1">
                      {t('parameterCategory:form.fields.mandatory.label')}
                    </div>
                    <div className="ui-font-medium">
                      {field.mandatory === 1 ? t('common:yes') : t('common:no')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ParameterCategoryDetailInfo
