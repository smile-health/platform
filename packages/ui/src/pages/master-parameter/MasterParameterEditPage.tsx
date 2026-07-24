import { useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import Container from '#components/layouts/PageContainer'
import Meta from '#components/layouts/Meta'
import MasterParameterForm from './components/MasterParameterForm'
import { detailMasterParameter } from './services/master-parameter.service'

export default function MasterParameterEditPage() {
  const { id: idParam } = useParams()
  const id = Number(idParam)
  const { t } = useTranslation() as any

  const { data, isLoading, isError } = useQuery({
    queryKey: ['master-parameter', id],
    queryFn: () => detailMasterParameter(id),
    enabled: !!id,
  })

  if (isLoading) {
    return <div>{t('common:loading')}</div>
  }

  if (isError || !data) {
    return <div>{t('common:data_not_found')}</div>
  }

  const defaultValues = {
    name: data.name,
    unit: data.unit || '',
    description: data.description,
  }

  return (
    <Container
      title={t('master-parameter:title.edit')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`Smile | ${t('master-parameter:title.edit')}`} />
      <div className="mt-6 space-y-6">
        <MasterParameterForm defaultValues={defaultValues} isEdit={true} id={id} />
      </div>
    </Container>
  )
}
