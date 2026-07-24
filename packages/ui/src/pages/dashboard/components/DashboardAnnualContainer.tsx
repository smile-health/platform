import { ReactNode, useState } from 'react'
import { Bars3Icon, ChartBarIcon } from '@heroicons/react/24/solid'
import { ButtonIcon } from '#components/button-icon'
import cx from '#lib/cx'

type View = 'chart' | 'table'
type Props = Readonly<{
  component?: ReactNode
  children: (view: View) => ReactNode
}>

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

export default function DashboardAnnualContainer({
  component,
  children,
}: Props) {
  const [view, setView] = useState<View>('chart')

  return (
    <div className="ui-space-y-3">
      <div className="ui-flex ui-justify-between ui-bg-[#F8FAFC] ui-space-y-2 ui-border-b ui-border-neutral-300 ui-p-3">
        {component ?? <div />}
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
