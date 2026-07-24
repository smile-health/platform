import React, { useRef } from 'react'
import { Button } from '#components/button'
import Bell from '#components/icons/Bell'
import { Spinner } from '#components/spinner'
import { useNotification } from '#hooks/useNotification'
import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'

import NotificationList from './NotificationList'

const DropdownNotification = () => {
  const ref = useRef(null)
  const { t } = useTranslation()

  const {
    data,
    isPendingDonwload,
    count,
    show,
    setShow,
    isLoading,
    isError,
    isSuccess,
    isPendingRead,
    isPendingReadAll,
    isDisabled,
    handleNotificationItemClick,
    handleSeeMore,
    handleMarkAllAsRead,
  } = useNotification({ filter: { page: 1, paginate: 10 } })

  return (
    <>
      {isPendingDonwload && <Spinner className="ui-my-8 ui-w-5" />}

      <div className="ui-relative" ref={ref}>
        <button
          id="trigger-notification"
          className={cx('ui-relative', {
            'hover:ui-text-blue-700 ui-cursor-pointer ui-text-blue-800':
              !isDisabled,
            'ui-cursor-not-allowed ui-text-slate-400': isDisabled,
          })}
          disabled={isDisabled}
          onClick={() => setShow((prev) => !prev)}
        >
          <Bell className="ui-mt-2" />
          {count > 0 && (
            <div className="ui-absolute ui-flex ui-items-center ui-justify-center ui-w-8 ui-h-5 ui-text-xs ui-text-white ui-bg-red-600 ui-rounded-full ui-top-[-8px] ui-right-[-1px]">
              {count > 99 ? '99+' : count}
            </div>
          )}
        </button>
        {show && (
          <div className="ui-absolute ui-z-20 ui-bg-white ui-border ui-border-gray-300 ui-rounded-lg ui-shadow-xl ui-left-[-300px] ui-w-[23rem]">
            <div className="ui-flex ui-justify-between ui-items-center ui-px-6 ui-py-2 ui-text-sm ui-border-b ui-border-gray-300 ui-h-[64px]">
              <div className="ui-text-dark ui-text-left font-semibold">
                {t('notification.title')}
              </div>
              {isLoading ? (
                <div className="ui-text-gray-600">
                  {t('notification.refreshing')}
                </div>
              ) : (
                <>
                  {count !== 0 && (
                    <Button
                      variant="subtle"
                      className="ui-text-primary-500"
                      onClick={handleMarkAllAsRead}
                      id="notification-read-all"
                    >
                      {isPendingRead || isPendingReadAll
                        ? t('notification.loading')
                        : t('notification.mark_all_as_read')}
                    </Button>
                  )}
                </>
              )}
            </div>
            <div>
              <NotificationList
                data={data}
                isLoading={isLoading}
                isError={isError}
                isSuccess={isSuccess}
                t={t}
                handleNotificationItemClick={handleNotificationItemClick}
              />

              <div className="ui-flex ui-items-center ui-justify-between ui-px-3 ui-py-3 ui-text-sm ui-border-t ui-border-gray-300">
                <Button
                  variant="subtle"
                  className="ui-text-primary-500 ui-mx-auto"
                  onClick={handleSeeMore}
                  id="navbar-notification"
                >
                  {t('notification.more')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default DropdownNotification
