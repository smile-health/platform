import { Button } from '#components/button'
import Export from '#components/icons/Export'
import { useTranslation } from 'react-i18next'

import useListExport from './useListExport'

export const ListExportButton = () => {
  const { t } = useTranslation(['common'])

  const listExport = useListExport()

  return (
    <Button
      id="btn-export"
      variant="subtle"
      type="button"
      onClick={listExport.fetch}
      leftIcon={<Export className="ui-size-5" />}
    >
      {t('common:export')}
    </Button>
  )
}
