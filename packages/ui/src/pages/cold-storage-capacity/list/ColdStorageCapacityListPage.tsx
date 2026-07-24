import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import ColdStorageCapacityHeader from './components/Header'
import ColdStorageCapacityTable from './use-cases/displayData/ColdStorageCapacityTable'
import ColdStorageCapacityFilter from './use-cases/filter/ColdStorageCapacityFilter'

export default function ColdStorageCapacityListPage() {
  const { t } = useTranslation('coldStorageCapacity')

  return (
    <Container title={t('title')} withLayout>
      <Meta title={generateMetaTitle(t('title'))} />
      <div className="ui-space-y-6">
        <ColdStorageCapacityHeader />
        <ColdStorageCapacityFilter />
        <ColdStorageCapacityTable />
      </div>
    </Container>
  )
}
