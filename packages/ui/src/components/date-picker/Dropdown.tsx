import { PropsWithChildren, useRef } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { Button } from '#components/button'
import { useOnClickOutside } from '#hooks/useOnClickOutside'
import cx from '#lib/cx'

type DropdownProps = PropsWithChildren<{
  label?: string
  open?: boolean
  setOpen?: (open: boolean) => void
}>

export function Dropdown({ label, open, setOpen, children }: DropdownProps) {
  const ref = useRef<HTMLDivElement>(null)

  useOnClickOutside(ref, () => setOpen?.(false))

  const handleClick = () => {
    if (setOpen) setOpen(!open)
  }

  return (
    <div ref={ref} className="ui-relative">
      <Button
        variant="default"
        size="sm"
        onClick={handleClick}
        className="ui-h-8"
        rightIcon={
          <ChevronDownIcon className="ui-size-4 ui-mt-1 ui-text-gray-600" />
        }
      >
        {label}
      </Button>
      <div
        hidden={!open}
        className="ui-absolute ui-rounded ui-top-10 ui-right-0 ui-border ui-border-slate-200 ui-shadow-md ui-bg-white ui-w-full ui-z-10 ui-py-1 ui-max-h-72 ui-overflow-y-auto"
      >
        {children}
      </div>
    </div>
  )
}

type DropdownItemProps = {
  label: string
  isSelected?: boolean
  onClick?: VoidFunction
}

export function DropdownItem({
  label,
  onClick,
  isSelected = false,
}: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'ui-block ui-w-full ui-px-2 ui-py-1 hover:ui-bg-primary-100 ui-text-left',
        {
          'ui-bg-primary-500 ui-text-primary-contrast': isSelected,
        }
      )}
    >
      {label}
    </button>
  )
}
