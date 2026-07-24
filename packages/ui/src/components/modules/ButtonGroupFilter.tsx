import { Fragment, ReactNode, useMemo } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '#components/dropdown-menu'
import Download from '#components/icons/Download'
import Export from '#components/icons/Export'
import Filter from '#components/icons/Filter'
import Import from '#components/icons/Import'
import Reload from '#components/icons/Reload'
import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'

import { Button, ButtonProps } from '../button'

export type DropdownData = {
  id: string
  label: string
  type: string[]
  onClick?: VoidFunction
  onDownloadTemplate?: VoidFunction
  disabled?: boolean
}

type TButton = 'reset' | 'import' | 'export' | 'download' | 'submit'

export type ButtonGroupFilterProps = {
  collapsible?: boolean
  onImport?: VoidFunction
  onExport?: VoidFunction
  onDownloadTemplate?: VoidFunction
  onReset?: VoidFunction
  show?: boolean
  onToggle?: VoidFunction
  layout?: 'row' | 'column'
  classNameLayout?: string
  hidden?: Array<TButton>
  classNameButtonGroup?: string
  classNameFilterForm?: string
  exportLoading?: boolean
  downloadLoading?: boolean
  importLoading?: boolean
  searchLoading?: boolean
  isDropdownDownloadTemplateButton?: boolean
  isDropdownImportButton?: boolean
  dropdownList?: DropdownData[]
  orderButtonFilter?: Array<TButton>
  configButtonFilterProps?: {
    reset?: ButtonProps
    import?: ButtonProps
    export?: ButtonProps
    download?: ButtonProps
    submit?: ButtonProps
  }
}

export type ButtonWithDropdownProps = {
  label: string
  id: string
  variant?: ButtonProps['variant']
  leftIcon: ReactNode
  dropdownList?: DropdownData[]
  isDownloadTemplate?: boolean
}

export const ButtonWithDropdown: React.FC<ButtonWithDropdownProps> = ({
  id,
  label,
  variant,
  leftIcon,
  dropdownList,
  isDownloadTemplate,
}) => {
  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger>
        <Button
          id={id}
          variant={variant ?? 'outline'}
          type="button"
          leftIcon={leftIcon}
        >
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {dropdownList?.map((item) => {
          return (
            <DropdownMenuItem key={item?.id} disabled={item?.disabled ?? false}>
              <div
                id={item.id}
                className="ui-w-full ui-text-left ui-h-full"
                onClick={
                  isDownloadTemplate ? item.onDownloadTemplate : item.onClick
                }
              >
                <h1>{item.label}</h1>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  )
}

export function ButtonGroupFilter(props: Readonly<ButtonGroupFilterProps>) {
  const {
    collapsible,
    onImport,
    onExport,
    onDownloadTemplate,
    onReset,
    show,
    onToggle,
    layout,
    classNameLayout,
    hidden,
    classNameButtonGroup,
    exportLoading,
    downloadLoading,
    importLoading,
    searchLoading,
    isDropdownDownloadTemplateButton,
    isDropdownImportButton,
    dropdownList,
    orderButtonFilter,
    configButtonFilterProps,
  } = props
  const { t } = useTranslation()
  const isHide = (
    type: 'reset' | 'import' | 'export' | 'download' | 'submit'
  ) => {
    return hidden?.includes(type)
  }
  const defaultOrder = [
    {
      key: 'reset',
      component: !isHide('reset') ? (
        <Button
          id="btn-refresh"
          type="button"
          variant="outline"
          onClick={onReset}
          {...configButtonFilterProps?.reset}
        >
          <Reload className="ui-size-5" />
        </Button>
      ) : null,
    },
    {
      key: 'import',
      component: !isHide('import') ? (
        <Fragment>
          {isDropdownImportButton ? (
            <ButtonWithDropdown
              id="btn-impor"
              label={t('import')}
              leftIcon={<Import className="ui-size-5" />}
              dropdownList={dropdownList}
            />
          ) : (
            <Button
              id="btn-import"
              onClick={onImport}
              loading={importLoading}
              variant="outline"
              type="button"
              leftIcon={<Import className="ui-size-5" />}
              {...configButtonFilterProps?.import}
            >
              {t('import')}
            </Button>
          )}
        </Fragment>
      ) : null,
    },
    {
      key: 'export',
      component: !isHide('export') ? (
        <Button
          id="btn-export"
          onClick={onExport}
          loading={exportLoading}
          variant="outline"
          type="button"
          leftIcon={<Export className="ui-size-5" />}
          {...configButtonFilterProps?.export}
        >
          {t('export')}
        </Button>
      ) : null,
    },
    {
      key: 'download',
      component: !isHide('download') ? (
        <Fragment>
          {isDropdownDownloadTemplateButton ? (
            <ButtonWithDropdown
              id="btn-download-template"
              leftIcon={<Download className="ui-size-5" />}
              label={t('download_template')}
              dropdownList={dropdownList}
              isDownloadTemplate={isDropdownDownloadTemplateButton}
            />
          ) : (
            <Button
              id="btn-download-template"
              onClick={onDownloadTemplate}
              loading={downloadLoading}
              variant="outline"
              type="button"
              leftIcon={<Download className="ui-size-5" />}
              {...configButtonFilterProps?.download}
            >
              {t('download_template')}
            </Button>
          )}
        </Fragment>
      ) : null,
    },
    {
      key: 'submit',
      component: !isHide('submit') ? (
        <Button
          id="btn-search"
          fullWidth
          loading={searchLoading}
          {...configButtonFilterProps?.submit}
        >
          {t('search')}
        </Button>
      ) : null,
    },
  ]

  const resultOrder = useMemo(() => {
    if (!orderButtonFilter) return defaultOrder

    const result = defaultOrder.toSorted((a, b) => {
      const indexA =
        orderButtonFilter.indexOf(a.key as TButton) < 0
          ? Infinity
          : orderButtonFilter.indexOf(a.key as TButton)
      const indexB =
        orderButtonFilter.indexOf(b.key as TButton) < 0
          ? Infinity
          : orderButtonFilter.indexOf(b.key as TButton)
      return indexA - indexB
    })

    return result
  }, [
    orderButtonFilter,
    exportLoading,
    downloadLoading,
    searchLoading,
    importLoading,
  ])

  return (
    <div
      className={cx(
        'ui-flex ui-gap-2',
        {
          'ui-justify-between': layout === 'column',
        },
        classNameButtonGroup
      )}
    >
      <div className="ui-flex ui-gap-2">
        {resultOrder.map((x, i) => i < 1 && x?.component)}
        {collapsible && (
          <Button
            id="btn-show-more"
            type="button"
            variant="outline"
            onClick={onToggle}
            leftIcon={
              show ? (
                <XMarkIcon className="ui-size-5" />
              ) : (
                <Filter className="ui-size-5" />
              )
            }
          >
            {show ? t('expand_filter.hide') : t('expand_filter.show')}
          </Button>
        )}
      </div>
      <div
        className={cx(
          'ui-grid ui-gap-2',
          classNameLayout ?? 'ui-grid-cols-[auto_auto_195px_202px]'
        )}
      >
        {resultOrder.map((x, i) => i > 0 && x?.component)}
      </div>
    </div>
  )
}
