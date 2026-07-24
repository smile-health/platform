'use client'

import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import useSmileRouter from '#hooks/useSmileRouter'
import { usePermission } from '#hooks/usePermission'
import { useTranslation } from 'react-i18next'

import ParameterCategoryDetailInfo from './components/ParameterCategoryDetailInfo'
import { useParameterCategoryDetail } from './hooks/useParameterCategoryDetail'

export default function ParameterCategoryDetailPage(): JSX.Element {
  usePermission('parameter-category-view')
  const { t } = useTranslation(['parameterCategory', 'common'])
  const router = useSmileRouter()

  const { data, isLoading } = useParameterCategoryDetail()

  return (
    <Container
      title={t('title.detail')}
      withLayout
      backButton={{
        label: t('common:back_to_list'),
        show: true,
        onClick: () => router.push('/v5/parameter-category'),
      }}
    >
      <Meta title={`Smile | ${t('title.detail')}`} />
      <div className="ui-space-y-6">
        <ParameterCategoryDetailInfo
          data={data}
          isLoading={isLoading}
        />
      </div>
    </Container>
  )
}
