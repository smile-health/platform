import { Button } from '#components/button'
import Download from '#components/icons/Download'
import { useTranslation } from 'react-i18next'

export const ListDownloadTemplateButton = () => {
  const { t } = useTranslation(['common'])

  return (
    <Button
      id="btn-download-template"
      variant="subtle"
      type="button"
      className="ui-px-2"
      leftIcon={<Download className="ui-size-5" />}
      onClick={() => {}}
    >
      {t('common:download_template')}
    </Button>
  )
}
