import { BarChart } from '#components/chart'
import DashboardBox from '#pages/dashboard/components/DashboardBox'

import { DataValue } from '../dashboard.type'

type Props = Readonly<{
  id: string
  data?: DataValue
  color?: string
  title: string
  subtitle?: string
  isLoading?: boolean
  exportFileName: string
}>

export default function DashboardEntityTagChart({
  id,
  data,
  color,
  title,
  subtitle,
  isLoading,
  exportFileName,
}: Props) {
  return (
    <div className="ui-col-span-4">
      <DashboardBox.Root id={id}>
        <DashboardBox.Header>
          <h4>
            <strong>{title}</strong>
          </h4>
          {subtitle && <p className="ui-text-base">{subtitle}</p>}
        </DashboardBox.Header>
        <DashboardBox.Body>
          <DashboardBox.Config
            download={{
              targetElementId: id,
              fileName: exportFileName,
            }}
          />
          <DashboardBox.Content
            className="ui-h-96"
            isLoading={isLoading}
            isEmpty={!data?.length}
          >
            <BarChart data={data || []} color={color} labelColor="#404040" />
          </DashboardBox.Content>
        </DashboardBox.Body>
      </DashboardBox.Root>
    </div>
  )
}
