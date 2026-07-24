import { ReactNode } from 'react'
import cx from '#lib/cx'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import dayjs from 'dayjs'
import { t } from 'i18next'
import { useTranslation } from 'react-i18next'

type Props = Readonly<{
  id: string
  title: ReactNode
  subtitle?: string
  info?: ReactNode
  isLoading?: boolean
  isEmpty?: boolean
  children: ReactNode
  showConfig?: boolean
  headerClassName?: string
  bodyClassName?: string
  containerClassName?: string
  subtitleClassName?: string
  contentClassName?: string
  lastUpdated?: string
  downloadExtensions?: string[]
  onDownloadCSV?: VoidFunction
}>

export default function DashboardColdStorageCapacityBox({
  id,
  title,
  subtitle,
  info,
  isLoading,
  isEmpty,
  children,
  showConfig = true,
  headerClassName,
  bodyClassName,
  containerClassName,
  subtitleClassName,

  contentClassName,
  lastUpdated,
  downloadExtensions,
  onDownloadCSV,
}: Props) {
  const { t } = useTranslation(['common', 'dashboardColdStorageCapacity'])

  return (
    <DashboardBox.Root
      id={id}
      className={cx(
        'ui-content-stretch ui-flex ui-w-full ui-flex-col ui-items-center',
        containerClassName
      )}
    >
      <DashboardBox.Header
        className={cx(
          'ui-bg-gray-100 ui-h-24 ui-flex ui-items-center ui-justify-center ui-flex-col w-full',
          headerClassName
        )}
      >
        <div className="ui-flex ui-items-center ui-justify-center">
          <h3 className={cx('ui-font-semibold')}>{title}</h3>
          {info && (
            <DashboardBox.InfoModal title={`${title} ${subtitle ?? ''}`}>
              {info}
            </DashboardBox.InfoModal>
          )}
        </div>
        {subtitle && (
          <p className={cx('ui-text-center ui-text-sm', subtitleClassName)}>
            {subtitle}
          </p>
        )}
      </DashboardBox.Header>
      <DashboardBox.Body
        className={cx('ui-flex ui-flex-col ui-flex-1 ui-w-full', bodyClassName)}
      >
        {showConfig && (
          <DashboardBox.Config
            download={{
              targetElementId: id,
              fileName: `${title} ${subtitle ?? ''}`,
              ...(downloadExtensions && { extensions: downloadExtensions }),
              ...(onDownloadCSV && { onCsvClick: onDownloadCSV }),
            }}
            withRegionSection={false}
          />
        )}
        <DashboardBox.Content
          isLoading={isLoading}
          isEmpty={isEmpty}
          className={cx(
            'ui-flex-1 ui-flex ui-justify-center ui-items-center ui-flex-col',
            contentClassName
          )}
        >
          {children}
          {lastUpdated && (
            <p className="ui-text-sm ui-text-gray-500 ui-text-center ui-pt-4 ui-pb-2.5">
              {t('dashboardColdStorageCapacity:section.last_updated_at')}{' '}
              <span className="ui-uppercase">
                {dayjs(lastUpdated).format('DD MMM YYYY HH:mm')}
              </span>
            </p>
          )}
        </DashboardBox.Content>
      </DashboardBox.Body>
    </DashboardBox.Root>
  )
}
