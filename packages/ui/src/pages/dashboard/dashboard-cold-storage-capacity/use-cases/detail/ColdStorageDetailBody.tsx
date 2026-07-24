import { ReactNode } from 'react'
import DashboardBox from '#pages/dashboard/components/DashboardBox'

type Props = {
  children: ReactNode
}

export function ColdStorageDetailBody({ children }: Props) {
  return (
    <DashboardBox.Body className="ui-bg-gray-100 ui-pt-0 ui-pb-6 ui-flex ui-flex-col ui-flex-1 ui-w-full">
      <div className="ui-space-y-4 ui-w-full ui-py-4">{children}</div>
    </DashboardBox.Body>
  )
}
