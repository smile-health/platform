import React, {
  createContext,
  PropsWithChildren,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { Button } from '#components/button'
import { ButtonIcon } from '#components/button-icon'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '#components/dropdown-menu'
import DownloadV2Icon from '#components/icons/DownloadV2Icon'
import { OptionType, ReactSelect } from '#components/react-select'
import { GlobalSpinner } from '#components/spinner'
import cx from '#lib/cx'
import { exportElement } from '#utils/download'
import { Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { DEFAULT_DOWNLOAD_EXTENSIONS } from '../dashboard.constant'

type Provider = {
  filter: Values<Record<string, any>>
  colorClass?: string
  showRegion?: boolean
  onDownloadAsCSV?: VoidFunction
}

const DashboardBoxContext = createContext<Provider>({
  filter: {},
})

export function DashboardBoxProvider({
  filter,
  colorClass,
  showRegion = true,
  onDownloadAsCSV,
  children,
}: PropsWithChildren<Provider>) {
  const contextValue = useMemo(() => {
    return {
      filter,
      colorClass,
      showRegion,
      onDownloadAsCSV,
    }
  }, [filter, colorClass, showRegion, onDownloadAsCSV])

  return (
    <DashboardBoxContext.Provider value={contextValue}>
      <div className="ui-space-y-6 mt-6">{children}</div>
    </DashboardBoxContext.Provider>
  )
}

export function DashboardBoxRoot({
  id,
  children,
  className,
}: {
  readonly children?: ReactNode
  readonly id: string
  readonly className?: string
}) {
  return (
    <div
      id={id}
      className={cx('ui-border ui-border-neutral-300 ui-rounded', className)}
    >
      {children}
    </div>
  )
}

export function DashboardBoxHeader({
  children,
  bordered,
  size = 'normal',
  className,
}: {
  readonly children: ReactNode
  readonly bordered?: boolean
  readonly size?: 'small' | 'normal'
  readonly className?: string
}) {
  const { colorClass } = useContext(DashboardBoxContext)

  return (
    <div
      className={cx(
        ' ui-rounded-t-[inherit] ui-text-center ui-bg-primary-500 ui-space-y-2',
        {
          'ui-border-b ui-border-neutral-300': bordered,
          'ui-p-5 ui-text-lg': size === 'normal',
          'ui-p-3': size === 'small',
        },
        colorClass,
        className
      )}
    >
      {children}
    </div>
  )
}

export function DashboardBoxBody({
  children,
  bordered,
  rounded,
  padded = true,
  className,
}: {
  readonly children: ReactNode
  readonly bordered?: boolean
  readonly rounded?: boolean
  readonly padded?: boolean
  readonly className?: string
}) {
  return (
    <div
      className={cx(
        'ui-relative ui-space-y-4 ui-bg-white',
        {
          ' ui-p-4': padded,
          'ui-border ui-border-neutral-300': bordered,
          'ui-rounded-md': rounded,
          'ui-rounded-b-[inherit]': !rounded,
        },
        className
      )}
    >
      {children}
    </div>
  )
}

type DashboardBoxConfigProps = Readonly<{
  download: {
    targetElementId: string | string[]
    fileName: string
    extensions?: Array<string>
    onXlsClick?: VoidFunction
    onCsvClick?: VoidFunction
    isRemoveContainerHeight?: boolean
    isCompactPdf?: boolean
  }
  sort?: {
    show?: boolean
    value: OptionType | null
    onChange: (option: OptionType) => void
    placeholder?: string
  }
  withRegionSection?: boolean
  withDownloadAction?: boolean
}>

export function DashboardBoxConfig({
  sort,
  download,
  withRegionSection = true,
  withDownloadAction = true,
}: DashboardBoxConfigProps) {
  const { filter, onDownloadAsCSV, showRegion } =
    useContext(DashboardBoxContext)
  const { t } = useTranslation('dashboard')

  const provinceLabel = filter?.province?.label
  const regencyLabel = filter?.regency?.label
  const entityLabel = filter?.entity?.label
  const isAllRegion =
    !provinceLabel && !regencyLabel && !entityLabel && withRegionSection

  const downloadExtensions = download?.extensions ?? DEFAULT_DOWNLOAD_EXTENSIONS

  return (
    <>
      <div className="ui-relative ui-flex ui-justify-center ui-items-center ui-min-h-10">
        {withRegionSection ||
          (showRegion && (
            <div className="ui-relative ui-space-y-1 ui-text-center ui-z-10">
              {isAllRegion ? (
                <h6>{t('all_regions')}</h6>
              ) : (
                <>
                  {entityLabel && (
                    <p>
                      <strong>{entityLabel}</strong>
                    </p>
                  )}
                  <p>
                    {regencyLabel ? `${regencyLabel},` : null} {provinceLabel}
                  </p>
                </>
              )}
            </div>
          ))}
        <div className="ui-absolute ui-right-0 ui-flex ui-justify-end ui-items-center ui-gap-4">
          {sort?.show && (
            <ReactSelect
              data-testid="sort"
              placeholder={sort?.placeholder}
              value={sort?.value}
              onChange={sort?.onChange}
              isClearable
              options={[
                {
                  label: t('sort.asc'),
                  value: 'asc',
                },
                {
                  label: t('sort.desc'),
                  value: 'desc',
                },
              ]}
            />
          )}
          {withDownloadAction && (
            <DropdownMenuRoot>
              <DropdownMenuTrigger>
                <ButtonIcon
                  size="lg"
                  variant="subtle"
                  className="ui-text-zinc-500"
                >
                  <DownloadV2Icon />
                </ButtonIcon>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {downloadExtensions?.map((item) => (
                  <DropdownMenuItem
                    key={item}
                    onClick={async () => {
                      if (
                        item === 'csv' &&
                        (onDownloadAsCSV || download.onCsvClick)
                      ) {
                        ;(onDownloadAsCSV || download.onCsvClick)?.()
                      } else if (item === 'xls' && download.onXlsClick) {
                        download.onXlsClick()
                      } else {
                        await exportElement(
                          download.targetElementId,
                          item,
                          download.fileName,
                          download.isRemoveContainerHeight,
                          download.isCompactPdf
                        )
                      }
                    }}
                  >
                    {t('export_as', {
                      format: item.toUpperCase(),
                    })}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenuRoot>
          )}
        </div>
      </div>
    </>
  )
}

export type DashboardBoxContentProps = PropsWithChildren<{
  isEmpty?: boolean
  className?: string
  isLoading?: boolean
}>

export function DashboardBoxContent({
  isEmpty,
  children,
  className,
  isLoading,
}: DashboardBoxContentProps) {
  const { t } = useTranslation('dashboard')

  return (
    <div
      className={cx(
        'ui-w-full ui-overflow-x-hidden',
        {
          'ui-grid ui-place-items-center ui-min-h-40': isLoading || isEmpty,
          'ui-text-primary-500': isLoading,
        },
        className
      )}
    >
      {isLoading && <GlobalSpinner />}
      {!isLoading && isEmpty && (
        <p className="ui-text-gray-500 ui-text-sm">{t('empty')}</p>
      )}
      {!isLoading && !isEmpty && children}
    </div>
  )
}

type DashboardBoxInfoModalProps = Readonly<{
  title: ReactNode
  children: ReactNode
}>

export function DashboardBoxInfoModal({
  title,
  children,
}: DashboardBoxInfoModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation('dashboard')

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="ui-ml-2"
        aria-label="Info"
      >
        <InformationCircleIcon className="ui-size-5 ui-text-neutral-500 ui-fill-dark-blue" />
      </button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogCloseButton />
        <DialogHeader>{title}</DialogHeader>
        <DialogContent>{children}</DialogContent>
        <DialogFooter className="ui-justify-center ui-border-t-0">
          <Button
            variant="outline"
            className="ui-w-full"
            onClick={() => setIsOpen(false)}
          >
            {t('close')}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}

const DashboardBox = {
  Provider: DashboardBoxProvider,
  Root: DashboardBoxRoot,
  Header: DashboardBoxHeader,
  Body: DashboardBoxBody,
  Config: DashboardBoxConfig,
  Content: DashboardBoxContent,
  InfoModal: DashboardBoxInfoModal,
}

export default DashboardBox
