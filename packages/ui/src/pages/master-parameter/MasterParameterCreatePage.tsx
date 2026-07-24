import { useTranslation } from 'react-i18next'
import Container from '#components/layouts/PageContainer'
import Meta from '#components/layouts/Meta'
import MasterParameterForm from './components/MasterParameterForm'

export default function MasterParameterCreatePage() {
  const { t } = useTranslation() as any

  return (
    <Container
      title={t('master-parameter:title.create')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`Smile | ${t('master-parameter:title.create')}`} />
      <div className="mt-6 space-y-6">
        <MasterParameterForm isEdit={false} />
      </div>
    </Container>
  )
}
