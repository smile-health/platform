import { PropsWithChildren } from 'react'
import { ButtonIcon } from '#components/button-icon'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '#components/dropdown-menu'
import Download from '#components/icons/Download'
import { GlobalSpinner } from '#components/spinner'
import cx from '#lib/cx'
import { exportElement } from '#utils/download'
import { useTranslation } from 'react-i18next'

import { DEFAULT_DOWNLOAD_EXTENSIONS } from '../dashboard.constant'

type Props = PropsWithChildren<{
  fileName: string
  isEmpty?: boolean
  isLoading?: boolean
  title?: string
  subtitle?: string
  extensions?: string[]
}>

export default function DashboardCommonChartContainer({
  fileName,
  isEmpty,
  isLoading,
  title,
  subtitle,
  children,
  extensions = DEFAULT_DOWNLOAD_EXTENSIONS,
}: Props) {
  const { t } = useTranslation('dashboard')

  return (
    <div
      className={cx(
        'ui-border ui-border-neutral-300/80 ui-rounded ui-p-2 ui-gap-y-4 ui-w-full ui-min-h-60 ui-flex ui-flex-col',
        {
          'ui-text-primary-500 ui-max-h-60': isLoading,
        }
      )}
    >
      {!isLoading && (
        <div className="ui-flex ui-justify-end">
          <DropdownMenuRoot>
            <DropdownMenuTrigger>
              <ButtonIcon size="lg" variant="default">
                <Download className="ui-size-5" />
              </ButtonIcon>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {extensions?.map((item) => (
                <DropdownMenuItem
                  key={item}
                  onClick={() => {
                    exportElement('dashboard-chart', item, fileName)
                  }}
                >
                  {t('export_as', {
                    format: item.toUpperCase(),
                  })}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenuRoot>
        </div>
      )}
      <div
        id="dashboard-chart"
        className={cx('ui-grow', {
          'ui-grid ui-place-items-center': isLoading || isEmpty,
          'ui-h-96 ui-flex ui-flex-col ui-text-center': !isEmpty && !isLoading,
        })}
      >
        {isLoading && <GlobalSpinner />}
        {!isLoading && isEmpty && (
          <p className="ui-text-gray-500 ui-text-sm">{t('empty')}</p>
        )}
        {!isLoading && !isEmpty && (
          <>
            {title && (
              <h3 className="ui-text-xl ui-font-semibold ui-text-gray-600">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="ui-text-semibold ui-text-gray-500/75 ui-font-medium">
                {subtitle}
              </p>
            )}
            <div className="ui-grow mt-2">{children}</div>
          </>
        )}
      </div>
    </div>
  )
}
