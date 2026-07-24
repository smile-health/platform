import { useState } from 'react'
import { BarChart } from '#components/chart'
import { OptionType } from '#components/react-select'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { Values } from 'nuqs'

import useGetRegencyChart from '../hooks/useGetRegencyChart'

type Props = Readonly<{
  id: string | string[]
  type: 'stock' | 'transaction'
  color?: string
  filter: Values<Record<string, any>>
  exportFileName: string
  sortPlaceholder: string
  bordered?: boolean
  rounded?: boolean
  isRemoveContainerHeight?: boolean
}>

export default function DashboardRegencyChart({
  id,
  type,
  color,
  filter,
  exportFileName,
  sortPlaceholder,
  bordered,
  rounded,
  isRemoveContainerHeight,
}: Props) {
  const [sort, setSort] = useState<OptionType | null>(null)

  const { data, isLoading } = useGetRegencyChart(filter, sort, type)

  return (
    <DashboardBox.Body bordered={bordered} rounded={rounded}>
      <DashboardBox.Config
        download={{
          targetElementId: id,
          fileName: exportFileName,
          isRemoveContainerHeight:
            isRemoveContainerHeight && data?.length <= 100,
        }}
        sort={{
          show: true,
          value: sort,
          onChange: setSort,
          placeholder: sortPlaceholder,
        }}
      />
      <DashboardBox.Content
        isLoading={isLoading}
        isEmpty={!data?.length}
        className="ui-max-h-[500px] ui-overflow-y-auto"
      >
        <BarChart
          data={data}
          layout="horizontal"
          color={color}
          labelColor="#404040"
        />
      </DashboardBox.Content>
    </DashboardBox.Body>
  )
}
