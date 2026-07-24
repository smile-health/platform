import React from 'react'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { Button } from '#components/button'
import SmileIcon from '#components/icons/SmileIcon'
import Whatsapp from '#components/icons/Whatsapp'
import { ProgramItem } from '#components/modules/ProgramItem'
import { BOOLEAN } from '#constants/common'
import { IconPrograms } from '#constants/program'
import { ActionButtonType } from '#hooks/useNotification'
import cx from '#lib/cx'
import { TNotification } from '#types/notification'
import { parseDateTime } from '#utils/date'
import { useTranslation } from 'react-i18next'

type NotificationItemProps = {
  item?: TNotification
  type?: 'popup' | 'page' | 'toast'
  handleNotificationItemClick?: (item?: TNotification) => void
  handleActionButtonItemClick?: (
    actionType: ActionButtonType,
    item?: TNotification
  ) => void
  handleClose?: () => void
  withBorder?: boolean
}

const replaceLink = (text: string, link: string) => {
  const element = document.createElement('a')
  element.setAttribute('target', '_blank')
  element.href = `https://${link}`
  element.innerText = link
  const textLink = element.outerHTML
  return text.replaceAll(link, textLink)
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  item,
  type = 'popup',
  withBorder = true,
  handleClose,
  handleActionButtonItemClick,
  handleNotificationItemClick,
}) => {
  const isToast = type === 'toast'
  const isPage = type === 'page'
  const { t } = useTranslation('notification')

  const notificationAction = (item?: TNotification) => {
    if (item?.action_url) {
      return (
        <Button
          onClick={() => handleActionButtonItemClick?.('action', item)}
          className="ui-text-xs"
        >
          {t('button.action')}
        </Button>
      )
    }

    if (item?.download_url) {
      return (
        <Button
          onClick={() => handleActionButtonItemClick?.('download', item)}
          className="ui-text-xs"
        >
          {t('button.download')}
        </Button>
      )
    }

    if (item?.data) {
      const shouldShowFinishedButton =
        item?.data?.stop_notification === BOOLEAN.FALSE &&
        item?.data?.show_mark_finished_button

      return (
        <div className="ui-flex ui-items-center ui-justify-between ui-text-xs ui-gap-2">
          {shouldShowFinishedButton && (
            <Button
              onClick={() =>
                handleActionButtonItemClick?.('finishedVaccine', item)
              }
              variant="outline"
              className="ui-text-xs"
            >
              {t('button.mark_as_finished')}
            </Button>
          )}
          {item?.data?.show_contact_button && (
            <Button
              onClick={() => handleActionButtonItemClick?.('whatsapp', item)}
              className="ui-text-xs"
            >
              <Whatsapp />
              <span className="ui-text-xs ui-ml-2">
                {t('button.contact_patient')}
              </span>
            </Button>
          )}
        </div>
      )
    }

    return null
  }

  return (
    <button
      id={`trigger-notification-item-${item?.id}`}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        handleNotificationItemClick?.(item)
      }}
      className={cx('ui-p-3 ui-text-xs ui-w-full ui-space-y-2', {
        'ui-bg-[#E2F3FC] ui-cursor-pointer': !isToast && item?.read_at === null,
        'ui-cursor-pointer': item?.download_url || !item?.read_at,
        ' ui-border ui-border-gray-300': withBorder,
        'ui-bg-white ui-rounded ui-shadow-lg': isToast,
      })}
    >
      <div className="ui-flex ui-items-center ui-justify-between">
        {item?.data?.show_finished_label ? (
          <FlagFinishedNotificationVaccine />
        ) : (
          <div className="ui-text-primary ui-text-sm ui-font-bold ui-text-left">
            {item?.type?.title ?? item?.title}
          </div>
        )}
        <div className="ui-text-[10px] ui-text-semibold ui-text-gray-700 ui-text-right">
          {!isToast ? (
            parseDateTime(item?.created_at, 'DD/MMM/YYYY HH:mm')
              .toUpperCase()
              .replaceAll('/', ' ')
          ) : (
            <Button
              className="ui-p-1 ui-h-7 ui-w-7 ui-text-gray-700"
              variant="subtle"
              onClick={handleClose}
            >
              <XMarkIcon className="ui-h-5 ui-w-5" />
            </Button>
          )}
        </div>
      </div>
      {item?.data?.show_finished_label && (
        <div className="ui-text-primary ui-text-sm ui-font-bold ui-text-left">
          {item?.type?.title ?? item?.title}
        </div>
      )}
      <div
        className="ui-text-dark ui-text-left ui-text-sm"
        dangerouslySetInnerHTML={{
          __html:
            (item?.action_url ?? '')
              ? replaceLink(item?.message || '', item?.action_url || '')
              : item?.message || '',
        }}
      />
      <div className="ui-text-xs ui-text-gray-700 ui-text-left">
        {[
          item?.entity?.name,
          item?.user?.username,
          item?.mobile_phone?.replace(/(\d{4})(\d{4})(\d+)/, '$1****$3'),
        ]
          .filter(Boolean)
          .join(' • ')}
      </div>
      <div className="ui-flex ui-items-center ui-justify-between ui-text-xs ui-text-gray-700 ui-text-left">
        <div className="ui-flex ui-items-center ui-justify-start ui-gap-2 ui-mt-2">
          {isToast && (
            <div className="ui-text-[10px] ui-text-semibold ui-text-gray-700">
              <SmileIcon />
            </div>
          )}
          {item?.program && (
            <ProgramItem
              id={`program-item-${item?.program?.name}`}
              data={item?.program}
              className={{
                wrapper: cx(
                  'ui-p-1 ui-border ui-border-gray-300 ui-bg-white !ui-gap-1',
                  {
                    'ui-rounded': !isToast,
                    'ui-rounded !ui-w-3 !ui-h-3': isToast,
                  }
                ),
                logo: cx('ui-w-6 ui-h-6', { '!ui-w-3 !ui-h-3': isToast }),
                label: 'ui-text-xs',
                title: 'ui-text-xs',
              }}
              icon={IconPrograms[item.program.key]}
              sizeIcon={24}
            />
          )}
        </div>
        {isToast && (
          <div className="ui-text-[10px] ui-text-semibold ui-text-gray-700">
            {parseDateTime(item?.created_at, 'DD/MMM/YYYY HH:mm')
              .toUpperCase()
              .replaceAll('/', ' ')}
          </div>
        )}
        {isPage && notificationAction(item)}
      </div>
    </button>
  )
}

const FlagFinishedNotificationVaccine = () => {
  const { t } = useTranslation(['common', 'notification'])

  return (
    <div className="ui-flex ui-gap-1 ui-items-center">
      <CheckCircleIcon className="ui-text-[#15803D] h-4 w-4" />
      <p className="ui-text-xs ui-text-[#15803D]">
        {t('notification:finishedVaccine.finished' as any)}
      </p>
    </div>
  )
}

export default NotificationItem
