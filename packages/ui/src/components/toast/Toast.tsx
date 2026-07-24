import { ReactNode } from 'react'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid'
import NotificationItem from '#components/layouts/AppLayout/NotificationItem'
import cx from '#lib/cx'
import { TNotification } from '#types/notification'
import { toast as originalToast, ToastPosition } from 'react-hot-toast'

type Status = 'success' | 'danger' | 'info' | 'warning'
type Toast = {
  title?: string
  description?: ReactNode
  position?: ToastPosition
  status?: Status
  duration?: number
  id?: string
  type?: 'standard' | 'notification'
  notification?: {
    item: TNotification
    handleNotificationItemClick: (item: TNotification) => void
  }
}
const base = ({
  status = 'success',
  description,
  title,
  position = 'top-right',
  duration,
  id,
  type = 'standard',
  notification,
}: Toast) => {
  originalToast.custom(
    (t) =>
      type === 'notification' ? (
        <div
          id={id}
          data-testid="toast-push-notification"
          className="ui-max-w-[376px]"
        >
          <NotificationItem
            type="toast"
            item={notification?.item}
            handleNotificationItemClick={
              notification?.handleNotificationItemClick
            }
            handleClose={() => originalToast.dismiss(t.id)}
          />
        </div>
      ) : (
        <div
          id={id}
          data-testid={`toast-${status}`}
          className={cx(
            'ui-pointer-events-auto ui-relative',
            'ui-w-full lg:ui-w-[360px]',
            'ui-rounded ui-py-3 ui-pl-3 ui-pr-9',
            {
              'ui-bg-success-600 ui-text-white': status === 'success',
              'ui-bg-danger-600 ui-text-white': status === 'danger',
              'ui-bg-warning-600 ui-text-white': status === 'warning',
              'ui-bg-info-600 ui-text-white': status === 'info',
            },
            {
              'ui-animate-enter': t.visible,
              'ui-animate-leave': !t.visible,
            }
          )}
        >
          <div className="ui-flex">
            <div className="ui-flex ui-justify-center ui-pr-2">
              {status === 'success' ? (
                <CheckCircleIcon className="ui-h-5 ui-w-5"></CheckCircleIcon>
              ) : null}
              {status === 'danger' ? (
                <XCircleIcon className="ui-h-5 ui-w-5"></XCircleIcon>
              ) : null}
              {status === 'warning' ? (
                <ExclamationCircleIcon className="ui-h-5 ui-w-5"></ExclamationCircleIcon>
              ) : null}
              {status === 'info' ? (
                <InformationCircleIcon className="ui-h-5 ui-w-5"></InformationCircleIcon>
              ) : null}
            </div>
            <div className="p-0">
              {title && (
                <div
                  data-testid={`toast-${status}-title`}
                  className="ui-font-semibold ui-leading-tight"
                >
                  {title}
                </div>
              )}
              {description && (
                <div
                  data-testid={`toast-${status}-description`}
                  className="ui-leading-tight"
                >
                  {description}
                </div>
              )}
            </div>
          </div>

          <button
            className={cx(
              'ui-absolute ui-right-1.5 ui-top-1.5 ui-rounded ui-p-0.5',
              {
                'hover:ui-bg-success-700 active:ui-bg-success-800':
                  status === 'success',
                'hover:ui-bg-danger-700 active:ui-bg-danger-800':
                  status === 'danger',
                'hover:ui-bg-warning-700 active:ui-bg-warning-800':
                  status === 'warning',
                'hover:ui-bg-info-700 active:ui-bg-info-800': status === 'info',
              }
            )}
            data-testid={`toast-${status}-button-close`}
            onClick={() => originalToast.dismiss(t.id)}
          >
            <XMarkIcon className="ui-h-4 ui-w-4"></XMarkIcon>
          </button>
        </div>
      ),
    {
      position: position,
      duration: duration,
      id: id,
    }
  )
}

type ToastProps = Omit<Toast, 'status'>
export const toast = {
  success: (params: ToastProps) => base({ ...params, status: 'success' }),
  danger: (params: ToastProps) => base({ ...params, status: 'danger' }),
  info: (params: ToastProps) => base({ ...params, status: 'info' }),
  warning: (params: ToastProps) => base({ ...params, status: 'warning' }),
}
