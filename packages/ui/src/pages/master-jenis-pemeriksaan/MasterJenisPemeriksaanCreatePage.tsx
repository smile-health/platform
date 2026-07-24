import { useTranslation } from 'react-i18next'
import Container from '#components/layouts/PageContainer'
import Meta from '#components/layouts/Meta'
import MasterJenisPemeriksaanForm from './components/MasterJenisPemeriksaanForm'

export default function MasterJenisPemeriksaanCreatePage() {
  const { t } = useTranslation() as any

  return (
    <Container
      title={t('master-jenis-pemeriksaan:title.create')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`Smile | ${t('master-jenis-pemeriksaan:title.create')}`} />
      <div className="mt-6 space-y-6">
        <MasterJenisPemeriksaanForm isEdit={false} />
      </div>
    </Container>
  )
}
