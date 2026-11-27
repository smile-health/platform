import { useTranslation } from 'react-i18next'
import GlobalSettings from '../GlobalSettings'

export default function GlobalSettingsRolePage() {
  const { t } = useTranslation('common')
  return (
    <GlobalSettings title={t('role_management.title')}>
      <div>{t('role_management.placeholder')}</div>
    </GlobalSettings>
  )
}
