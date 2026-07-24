'use client'

import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import { useTranslation } from 'react-i18next'

import ParameterCategoryForm from './components/ParameterCategoryForm'

export default function ParameterCategoryCreatePage(): JSX.Element {
  usePermission('parameter-category-mutate')
  const { t } = useTranslation(['common', 'parameterCategory'])
  return (
    <Container
      title={t('parameterCategory:title.create')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`Smile | ${t('parameterCategory:title.create')}`} />
      <div className="mt-6 space-y-6">
        <ParameterCategoryForm />
      </div>
    </Container>
  )
}
