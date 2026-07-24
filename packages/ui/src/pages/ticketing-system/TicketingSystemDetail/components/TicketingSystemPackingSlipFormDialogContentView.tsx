import React, { useContext } from 'react'
import Link from 'next/link'
import { DialogContent } from '#components/dialog'
import { useTranslation } from 'react-i18next'

import TicketingSystemDetailContext from '../libs/ticketing-system-detail.context'

const TicketingSystemPackingSlipFormDialogContentView = () => {
  const { t } = useTranslation(['ticketingSystemDetail', 'common'])
  const { detail } = useContext(TicketingSystemDetailContext)

  const normalizeUrl = (url: string): string => {
    if (!/^https?:\/\//i.test(url)) {
      return 'https://' + url
    }
    return url
  }

  const trimUrl = (url: string, maxLength: number) => {
    const normalizedUrl = normalizeUrl(url)
    if (normalizedUrl.length <= maxLength) {
      return normalizedUrl
    }
    const trimmedUrl = `${normalizedUrl.substring(0, maxLength)}...`
    return trimmedUrl
  }

  return (
    <DialogContent className="ui-overflow-auto ui-my-2 ui-py-2 ui-scroll-pr-2">
      <div className="ui-my-4">
        <div className="ui-block ui-text-sm ui-font-medium ui-leading-none ui-text-gray-500 ui-mb-1">
          {t('ticketingSystemDetail:float_bar.panging_slip_link')}
        </div>
        <Link
          href={detail?.slip_link as string}
          target="_blank"
          className="ui-block ui-underline ui-text-ellipsis ui-break-all ui-text-primary-500 ui-transition-colors ui-duration-200 hover:ui-text-primary-400"
        >
          {trimUrl(detail?.slip_link as string, 300)}
        </Link>
      </div>
    </DialogContent>
  )
}

export default TicketingSystemPackingSlipFormDialogContentView
