import React, { createContext, useContext, useMemo, useRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { Button, ButtonVariant } from '#components/button'
import Filter from '#components/icons/Filter'
import Reload from '#components/icons/Reload'
import { useOnClickOutside } from '#hooks/useOnClickOutside'
import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'

type Provider = {
  collapsible: boolean
  expanded: boolean
  toggleExpand: () => void
  setExpanded: (value: boolean) => void
}

const FilterContext = createContext<Provider>({
  expanded: false,
  collapsible: false,
  toggleExpand: () => {},
  setExpanded: () => {},
})

export function FilterFormRoot({
  onSubmit,
  children,
  collapsible = false,
  className,
}: Readonly<{
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  children: React.ReactNode
  collapsible?: boolean
  className?: string
}>) {
  const [expanded, setExpanded] = React.useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => {
    setTimeout(() => setExpanded(false), 0)
  }, ['svg', 'path'])

  const contextValue = useMemo(() => {
    return {
      expanded,
      collapsible,
      toggleExpand: () => setExpanded((prev) => !prev),
      setExpanded,
    }
  }, [expanded, collapsible, setExpanded])

  return (
    <FilterContext.Provider value={contextValue}>
      <div
        id="filter-form-container"
        ref={collapsible ? ref : null}
        className="ui-relative"
      >
        <form
          onSubmit={onSubmit}
          data-expanded={collapsible ? expanded : false}
          className={cx(
            'ui-group ui-border ui-border-gray-300 ui-p-5 ui-space-y-4 ui-rounded ui-w-full ui-bg-white',
            {
              'data-[expanded=true]:ui-shadow-2xl ui-transition-all':
                collapsible,
            },
            className
          )}
        >
          {children}
        </form>
      </div>
    </FilterContext.Provider>
  )
}

export function FilterFormFooter({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return <div className="ui-flex ui-gap-2 ui-justify-between">{children}</div>
}

export function FilterFormBody({
  children,
  className,
}: Readonly<{
  children: React.ReactNode
  className?: string
}>) {
  const ref = useRef<HTMLDivElement>(null)
  const { collapsible } = useContext(FilterContext)
  return (
    <div
      ref={ref}
      className={cx(
        'ui-grid ui-grid-cols-2 ui-gap-4 ui-transition-all',
        {
          'group-data-[expanded=false]:ui-h-[65px] ui-px-[1.5px]': collapsible,
          'group-data-[expanded=false]:ui-overflow-y-hidden': collapsible,
        },
        className
      )}
    >
      {children}
    </div>
  )
}

export function FilterExpandButton({
  variant = 'outline',
}: {
  readonly variant?: ButtonVariant
}) {
  const { t } = useTranslation()
  const { expanded, toggleExpand } = useContext(FilterContext)
  return (
    <Button
      id="btn-show-more"
      data-testid="btn-show-more"
      type="button"
      variant={variant}
      onClick={toggleExpand}
      leftIcon={
        expanded ? (
          <XMarkIcon className="ui-size-5" />
        ) : (
          <Filter className="ui-size-5" />
        )
      }
    >
      {expanded ? t('expand_filter.hide') : t('expand_filter.show')}
    </Button>
  )
}

export function FilterSubmitButton({
  className,
  variant,
  onClick,
  text,
  disabled,
}: Readonly<{
  className: string
  variant?: ButtonVariant
  onClick?: () => void
  text?: string
  disabled?: boolean
}>) {
  const { t } = useTranslation(['common'])
  const { setExpanded } = useContext(FilterContext)
  return (
    <Button
      id="btn-submit"
      data-testid="btn-submit"
      type="submit"
      className={className}
      variant={variant}
      disabled={disabled}
      onClick={() => {
        onClick?.()
        setExpanded(false)
      }}
    >
      {text ?? t('search')}
    </Button>
  )
}

export function FilterResetButton({
  variant = 'outline',
  onClick,
  disabled = false,
  id = 'btn-reset',
}: Readonly<{
  variant?: ButtonVariant
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  id?: string
}>) {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick?.(event)
    // Remove focus to hide the border shadow after clicking
    event.currentTarget.blur()
  }

  return (
    <Button
      id={id}
      data-testid={id}
      type="button"
      variant={variant}
      onClick={handleClick}
      disabled={disabled}
      leftIcon={<Reload className="ui-size-5" />}
      className="[&.ui-focus-none]:!ui-ring-0 [&.ui-focus-none]:!ui-ring-transparent [&.ui-focus-none]:!ui-outline-none [&.ui-focus-none]:!ui-shadow-none"
    >
      Reset
    </Button>
  )
}
