import { useTranslation } from 'react-i18next'
import Container from '#components/layouts/PageContainer'
import Meta from '#components/layouts/Meta'
import MasterMethodForm from './components/MasterMethodForm'

export default function MasterMethodCreatePage() {
  const { t } = useTranslation() as any

  return (
    <Container
      title={t('master-method:title.create')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`Smile | ${t('master-method:title.create')}`} />
      <div className="mt-6 space-y-6">
        <MasterMethodForm isEdit={false} />
      </div>
    </Container>
  )
}
