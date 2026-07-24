import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

type Props = Readonly<{
  date?: string
}>

export default function DashboardRabiesLastUpdated({ date }: Props) {
  const { t } = useTranslation('dashboardRabies')

  return (
    <p className="ui-text-xs text-center text-gray-600">
      {t('label.last_updated')}{' '}
      {date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'}
    </p>
  )
}
