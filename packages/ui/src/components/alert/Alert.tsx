'use client'

import React from 'react'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid'
import cx from '#lib/cx'

export type AlertType = 'danger' | 'warning' | 'success' | 'info' | 'neutral'

type CloseButtonProps = {
  type?: AlertType
  onClick: React.MouseEventHandler<HTMLButtonElement>
}
function CloseButton({ type = 'danger', onClick }: Readonly<CloseButtonProps>) {
  return (
    <div className="ui-absolute ui-right-2.5 ui-top-2">
      <button
        className={cx('ui-h-7 ui-w-7 ui-rounded ui-p-1 ui-transition-all', {
          'ui-text-warning-700 hover:ui-bg-warning-200 active:ui-bg-warning-300':
            type === 'warning',
          'ui-text-danger-700 hover:ui-bg-danger-200 active:ui-bg-danger-300':
            type === 'danger',
          'ui-text-success-700 hover:ui-bg-success-200 active:ui-bg-success-300':
            type === 'success',
          'ui-text-info-700 hover:ui-bg-info-200 active:ui-bg-info-300':
            type === 'info',
          'ui-text-gray-700 hover:ui-bg-gray-200 active:ui-bg-gray-300':
            type === 'neutral',
        })}
        onClick={onClick}
      >
        <XMarkIcon></XMarkIcon>
      </button>
    </div>
  )
}

function Icon({ type = 'danger' }: { readonly type?: AlertType }) {
  const icon = {
    success: <CheckCircleIcon></CheckCircleIcon>,
    danger: <XCircleIcon></XCircleIcon>,
    info: <InformationCircleIcon></InformationCircleIcon>,
    warning: <ExclamationTriangleIcon></ExclamationTriangleIcon>,
    neutral: <InformationCircleIcon></InformationCircleIcon>,
  }
  return (
    <div
      className={cx('ui-h-5 ui-w-5', {
        'ui-text-warning-500': type === 'warning',
        'ui-text-danger-500': type === 'danger',
        'ui-text-success-500': type === 'success',
        'ui-text-info-500': type === 'info',
        'ui-text-gray-500': type === 'neutral',
      })}
    >
      {icon[type]}
    </div>
  )
}

export type AlertProps = {
  type?: AlertType
  title?: string
  children?: React.ReactNode
  closeable?: boolean
  withIcon?: boolean
  withAccent?: boolean
  containerClassName?: string
  className?: string
}
export function Alert({
  type = 'danger',
  title,
  children,
  closeable = false,
  withIcon,
  withAccent = false,
  className,
}: Readonly<AlertProps>) {
  const [show, setShow] = React.useState(true)

  if (!show) {
    return null
  }

  return (
    <div
      className={cx(
        'ui-relative ui-flex ui-items-start ui-space-x-3 ui-rounded-r ui-px-3 ui-py-3 ',
        {
          'ui-border-warning-500 ui-bg-warning-50': type === 'warning',
          'ui-border-danger-500 ui-bg-danger-50': type === 'danger',
          'ui-border-success-500 ui-bg-success-50': type === 'success',
          'ui-border-info-500 ui-bg-info-50': type === 'info',
          'ui-border-gray-500 ui-bg-gray-100': type === 'neutral',
        },
        {
          'ui-rounded-l': !withAccent,
          'ui-border-l-2': withAccent,
        },
        className
      )}
    >
      {withIcon ? <Icon type={type}></Icon> : null}
      <div
        className={cx('ui-flex-1 ui-space-y-1.5', {
          'ui-text-warning-800': type === 'warning',
          'ui-text-danger-800': type === 'danger',
          'ui-text-success-800': type === 'success',
          'ui-text-info-800': type === 'info',
          'ui-text-gray-800': type === 'neutral',
        })}
      >
        {title ? (
          <div className="ui-text-sm ui-font-semibold ui-leading-tight">
            {title}
          </div>
        ) : null}
        {children ? <div className="ui-text-sm">{children}</div> : null}
      </div>
      {closeable ? (
        <CloseButton type={type} onClick={() => setShow(false)}></CloseButton>
      ) : null}
    </div>
  )
}
