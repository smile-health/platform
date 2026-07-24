import { useContext } from 'react'
import { UserIcon } from '@heroicons/react/24/solid'
import { getFullName } from '#utils/strings'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import TicketingSystemDeatilContext from '../libs/ticketing-system-detail.context'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

export default function TicketingSystemDetailComment() {
  const {
    t,
    i18n: { language },
  } = useTranslation('ticketingSystem')
  const { detail } = useContext(TicketingSystemDeatilContext)

  return (
    <div className="ui-p-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-6">
      <h2 className="ui-mb-6 ui-text-base ui-font-bold ui-text-dark-teal ui-cursor-default">
        {t('title.detail.comment')} ({detail?.comments?.length ?? 0})
      </h2>
      {detail?.comments?.map((item) => {
        return (
          <div
            key={item?.id}
            className="ui-border ui-rounded ui-p-4 ui-flex ui-gap-2 ui-items-start"
          >
            <UserIcon className="ui-w-5 ui-fill-gray-500 ui-mt-0.5" />
            <div className="ui-space-y-1">
              <div className="ui-flex ui-gap-1.5">
                <span className="ui-text-dark-blue ui-font-semibold">
                  {getFullName(item?.user?.firstname, item?.user?.lastname)}
                </span>
                <span className="ui-text-gray-500">
                  {item?.created_at
                    ? dayjs(item?.created_at)
                        .locale(language)
                        .format('DD MMM YYYY HH:mm')
                        ?.toUpperCase()
                    : '-'}
                </span>
              </div>
              <div className="ui-text-dark-blue">{item?.comment ?? '-'}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
