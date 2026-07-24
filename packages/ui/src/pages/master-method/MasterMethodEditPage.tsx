import { useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import Container from '#components/layouts/PageContainer'
import Meta from '#components/layouts/Meta'
import MasterMethodForm from './components/MasterMethodForm'
import { detailMasterMethod } from './services/master-method.service'

export default function MasterMethodEditPage() {
  const { id: idParam } = useParams()
  const id = Number(idParam)
  const { t } = useTranslation() as any

  const { data, isLoading, isError } = useQuery({
    queryKey: ['master-method', id],
    queryFn: () => detailMasterMethod(id),
    enabled: !!id,
  })

  if (isLoading) {
    return <div>{t('common:loading')}</div>
  }

  if (isError || !data) {
    return <div>{t('common:data_not_found')}</div>
  }

  // Transform data to form values
  const defaultValues = {
    name: data.name,
    description: data.description,
  }

  return (
    <Container
      title={t('master-method:title.edit')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`Smile | ${t('master-method:title.edit')}`} />
      <div className="mt-6 space-y-6">
        <MasterMethodForm
          defaultValues={defaultValues}
          isEdit={true}
          id={id}
        />
      </div>
    </Container>
  )
}
