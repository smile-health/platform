import React, { useRef } from 'react'
import { AriaButtonProps, useButton } from 'react-aria'

interface ButtonProps extends AriaButtonProps<'button'> {
  readonly children: React.ReactNode
}

export function ClearButton(props: ButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const { buttonProps } = useButton(props, ref)
  const { children } = props
  const id = `${buttonProps.id}-clear-button`

  return (
    <button
      {...buttonProps}
      id={id}
      data-testid={id}
      className="ui-absolute ui-right-0 ui-rounded-full ui-items-center ui-justify-center ui-top-1/2 -ui-translate-y-1/2 mr-1 flex h-5 w-5"
      type="button"
      ref={ref}
    >
      {children}
    </button>
  )
}
