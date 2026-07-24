import { ReactNode } from 'react'
import cx from '#lib/cx'
import DashboardBox from '#pages/dashboard/components/DashboardBox'

type DashboardTemperatureMonitoringBoxProps = Readonly<{
  id: string
  title: string
  info?: ReactNode
  isLoading?: boolean
  isEmpty?: boolean
  children: ReactNode
  showConfig?: boolean
  headerClassName?: string
  bodyClassName?: string
}>

export default function DashboardTemperatureMonitoringBox({
  id,
  title,
  info,
  isLoading,
  isEmpty,
  children,
  showConfig = true,
  headerClassName,
  bodyClassName,
}: DashboardTemperatureMonitoringBoxProps) {
  return (
    <DashboardBox.Root
      id={id}
      className="ui-content-stretch ui-flex ui-w-full ui-flex-col ui-items-center"
    >
      <DashboardBox.Header
        className={cx('ui-bg-gray-100 w-full', headerClassName)}
      >
        <div className="ui-flex ui-items-center ui-justify-center">
          <h3 className="ui-font-semibold">{title}</h3>
          {info && (
            <DashboardBox.InfoModal title={title}>
              {info}
            </DashboardBox.InfoModal>
          )}
        </div>
      </DashboardBox.Header>
      <DashboardBox.Body
        className={cx(
          'ui-flex ui-flex-col ui-flex-1 ui-w-full ui-overflow-y-hidden max-h-[100px]',
          bodyClassName
        )}
      >
        {showConfig && (
          <DashboardBox.Config
            download={{
              targetElementId: id,
              fileName: title,
            }}
            withRegionSection={false}
          />
        )}
        <DashboardBox.Content
          isLoading={isLoading}
          isEmpty={isEmpty}
          className="ui-flex-1 ui-flex ui-justify-center ui-items-center
          ui-flex-col"
        >
          {children}
        </DashboardBox.Content>
      </DashboardBox.Body>
    </DashboardBox.Root>
  )
}
