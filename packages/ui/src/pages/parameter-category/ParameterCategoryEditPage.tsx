'use client'

import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import { useTranslation } from 'react-i18next'

import ParameterCategoryForm from './components/ParameterCategoryForm'
import { useParameterCategoryDetail } from './hooks/useParameterCategoryDetail'

export default function ParameterCategoryEditPage(): JSX.Element {
  usePermission('parameter-category-mutate')
  const { t } = useTranslation(['common', 'parameterCategory'])
  const { data, isLoading } = useParameterCategoryDetail()

  if (isLoading) return <div>Loading...</div>

  return (
    <Container
      title={t('parameterCategory:title.edit')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`Smile | ${t('parameterCategory:title.edit')}`} />
      <div className="mt-6 space-y-6">
        <ParameterCategoryForm isEdit defaultValues={data} />
      </div>
    </Container>
  )
}
