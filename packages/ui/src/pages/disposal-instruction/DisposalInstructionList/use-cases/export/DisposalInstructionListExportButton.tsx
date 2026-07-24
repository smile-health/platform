import { Button } from '#components/button'
import Export from '#components/icons/Export'
import { useTranslation } from 'react-i18next'

import useDisposalInstructionListTable from '../displayData/useDisposalInstructionListTable'
import useDisposalInstructionListFilter from '../filter/useDisposalInstructionListFilter'
import useDisposalInstructionListExport from './useDisposalInstructionListExport'

const DisposalInstructionListExportButton = () => {
  const { t } = useTranslation()

  const disposalInstructionListTable = useDisposalInstructionListTable()
  const disposalInstructionListFilter = useDisposalInstructionListFilter()
  const disposalInstructionListExport = useDisposalInstructionListExport({
    pagination: disposalInstructionListTable.pagination,
    filter: disposalInstructionListFilter.query,
  })

  return (
    <Button
      id="btn-export"
      variant="subtle"
      type="button"
      onClick={() => disposalInstructionListExport.fetch()}
      leftIcon={<Export className="ui-size-5" />}
    >
      {t('export')}
    </Button>
  )
}

export default DisposalInstructionListExportButton
