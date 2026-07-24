import { ReactNode } from 'react'
import DashboardBox from '#pages/dashboard/components/DashboardBox'

type Props = {
  children: ReactNode
}

export function ColdStorageDetailBox({ children }: Props) {
  return (
    <DashboardBox.Root
      id="details-cold-storage"
      className="ui-content-stretch ui-flex ui-w-full ui-flex-col ui-items-center"
    >
      {children}
    </DashboardBox.Root>
  )
}
