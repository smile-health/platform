import { useTranslation } from 'react-i18next'
import Container from '#components/layouts/PageContainer'
import Meta from '#components/layouts/Meta'
import MasterPemeriksaanForm from './components/MasterPemeriksaanForm'

/**
 * Master Pemeriksaan Create Page
 * Form to create new master pemeriksaan entry
 *
 * @example
 * // In your Next.js page:
 * import { MasterPemeriksaanCreatePage } from '@repo/ui/pages/master-pemeriksaan'
 *
 * export default function Page() {
 *   return <MasterPemeriksaanCreatePage />
 * }
 */
export default function MasterPemeriksaanCreatePage() {
  const { t } = useTranslation() as any

  return (
    <Container
      title={t('master-pemeriksaan:title.create')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`Smile | ${t('master-pemeriksaan:title.create')}`} />
      <div className="mt-6 space-y-6">
        <MasterPemeriksaanForm isEdit={false} />
      </div>
    </Container>
  )
}
