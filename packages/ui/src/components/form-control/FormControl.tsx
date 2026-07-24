import React from 'react'
import cx from '#lib/cx'

export function FormControl({
  children,
  className,
}: {
  readonly children?: React.ReactNode
  readonly className?: string
}) {
  return (
    <div className={cx('ui-relative ui-space-y-2', className)}>{children}</div>
  )
}

export function FormLabel({
  children,
  required,
  ...props
}: React.ComponentProps<'label'> & {
  children?: React.ReactNode
  required?: boolean
}) {
  return (
    <label
      {...props}
      className={cx(
        'ui-block ui-text-sm ui-font-medium ui-leading-none ui-text-gray-500',
        props.className
      )}
    >
      {children}
      {required ? <span className="ui-ml-1 ui-text-danger-500">*</span> : null}
    </label>
  )
}
export function FormErrorMessage({
  id,
  children,
  ...props
}: {
  readonly id?: string
  readonly children?: React.ReactNode
  readonly required?: boolean
  readonly className?: string
}) {
  return (
    <div
      {...props}
      id={id}
      className={cx(
        'ui-text-sm ui-leading-[20px] ui-text-danger-500',
        props.className
      )}
    >
      {children}
    </div>
  )
}

export function FormDescription({
  children,
}: Readonly<{ children?: React.ReactNode }>) {
  return (
    <div className="ui-text-sm ui-leading-none ui-text-gray-500">
      {children}
    </div>
  )
}
