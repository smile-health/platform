import { ReactNode, useState } from 'react'
import { Bars3Icon, ChartBarIcon } from '@heroicons/react/24/solid'
import { ButtonIcon } from '#components/button-icon'
import cx from '#lib/cx'
import { parseDateTime } from '#utils/date'
import { useTranslation } from 'react-i18next'

type View = 'chart' | 'table'
type Props = {
  updatedAt?: string
  children: (view: View) => ReactNode
}

const buttons = [
  {
    type: 'chart' as View,
    Icon: ChartBarIcon,
  },
  {
    type: 'table' as View,
    Icon: Bars3Icon,
  },
]

export default function DashboardOverallContainer({
  updatedAt,
  children,
}: Props) {
  const { t } = useTranslation('dashboard')
  const [view, setView] = useState<View>('chart')

  return (
    <div className="ui-space-y-3">
      <div className="ui-flex ui-justify-between ui-gap-1 ui-items-center ui-border ui-border-neutral-300 ui-rounded ui-p-2">
        {updatedAt ? (
          <p className="ui-text-gray-500">
            {t('last_updated_at')}: {parseDateTime(updatedAt)}
          </p>
        ) : (
          <div />
        )}
        <div className="ui-flex ui-gap-1">
          {buttons.map((button) => (
            <ButtonIcon
              key={button.type}
              size="md"
              variant="default"
              onClick={() => setView(button.type)}
              className={cx({
                'ui-bg-gray-300 ui-pointer-events-none': button.type === view,
              })}
            >
              <button.Icon className="ui-size-5" />
            </ButtonIcon>
          ))}
        </div>
      </div>
      {children(view)}
    </div>
  )
}
