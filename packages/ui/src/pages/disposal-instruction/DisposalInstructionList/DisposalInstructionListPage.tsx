import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import { DisposalInstructionListHeader } from './components'
import { DisposalInstructionListProvider } from './DisposalInstructionListContext'
import DisposalInstructionListTable from './use-cases/displayData/DisposalInstructionListTable'
import DisposalInstructionListFilter from './use-cases/filter/DisposalInstructionListFilter'

export default function DisposalInstructionListPage() {
  const { t } = useTranslation('disposalInstructionList')

  return (
    <DisposalInstructionListProvider>
      <Meta title={generateMetaTitle(t('page.title'))} />
      <Container title={t('page.title')} withLayout>
        <div className="ui-space-y-6">
          <DisposalInstructionListHeader />
          <DisposalInstructionListFilter />
          <DisposalInstructionListTable />
        </div>
      </Container>
    </DisposalInstructionListProvider>
  )
}
