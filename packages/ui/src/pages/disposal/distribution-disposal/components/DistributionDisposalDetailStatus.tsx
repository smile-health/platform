import React, { useContext } from 'react'
import { parseDateTime } from '#utils/date'
import { useTranslation } from 'react-i18next'

import { STATUS_DISTRIBUTION_DISPOSAL } from '../constants/status'
import DistributionDisposalDetailContext from '../utils/distribution-disposal-detail.context'
import DistributionDisposalDetailCustomerVendor from './DistributionDisposalDetailCustomerVendor'
import DistributionDisposalDownloadMemorandumButton from './DistributionDisposalDownloadMemorandumButton'
import DistributionDisposalListStatusCapsule from './DistributionDisposalListStatusCapsule'

import 'dayjs/locale/en'
import 'dayjs/locale/id'

const { SENT, APPROVED, CANCELLED } = STATUS_DISTRIBUTION_DISPOSAL

const DistributionDisposalDetailStatus = () => {
  const { data, inProcess } = useContext(DistributionDisposalDetailContext)

  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'distributionDisposal'])

  const statusBox = [
    {
      status: SENT,
      date: data?.shipped_at
        ? parseDateTime(
            data?.shipped_at,
            'DD MMM YYYY HH:mm',
            language
          )?.toUpperCase()
        : null,
      user: data?.user_shipped_by
        ? `${data.user_shipped_by.firstname} ${data.user_shipped_by.lastname ?? ''}`
        : null,
    },
    {
      status: APPROVED,
      date: data?.fulfilled_at
        ? parseDateTime(
            data?.fulfilled_at,
            'DD MMM YYYY HH:mm',
            language
          )?.toUpperCase()
        : null,
      user: data?.user_fulfilled_by
        ? `${data.user_fulfilled_by.firstname} ${data.user_fulfilled_by.lastname ?? ''}`
        : null,
    },
    {
      status: CANCELLED,
      date: data?.cancelled_at
        ? parseDateTime(
            data?.cancelled_at,
            'DD MMM YYYY HH:mm',
            language
          )?.toUpperCase()
        : null,
      user: data?.user_cancelled_by
        ? `${data.user_cancelled_by.firstname} ${data.user_cancelled_by.lastname ?? ''}`
        : null,
    },
  ]

  if (inProcess) {
    return (
      <>
        <div className="ui-border ui-rounded ui-border-orange-700 ui-py-3 ui-px-4 ui-text-orange-700 ui-mb-6 ui-font-bold ui-text-base">
          {t('distributionDisposal:detail.process_warning')}
        </div>
        <DistributionDisposalDetailCustomerVendor />
      </>
    )
  }

  return (
    <div className="ui-border ui-rounded ui-border-neutral-300 ui-py-6">
      <div className="ui-flex ui-justify-between ui-items-start ui-pt-6 ui-px-6">
        <h2 className="ui-text-dark-teal ui-font-semibold">
          {t('distributionDisposal:detail.disposal_shipment_status')}
        </h2>
      </div>
      <div className="ui-mb-6 ui-px-6">
        <div className="ui-inline-flex ui-items-start ui-gap-10 relative">
          {data && (
            <>
              <div className="ui-absolute -ui-z-10 ui-left-0 ui-top-[15px] ui-h-[1.25px] ui-w-full ui-bg-gray-300" />
              {statusBox.map((item) => (
                <DistributionDisposalListStatusCapsule
                  key={item.status}
                  status={item.status}
                  date={item.date}
                  user={item.user}
                />
              ))}
            </>
          )}
        </div>
      </div>
      <div className="ui-px-6">
        <DistributionDisposalDetailCustomerVendor />
      </div>
      {data?.status !== CANCELLED && (
        <>
          <div className="ui-h-1 ui-border-t ui-border-neutral-300 ui-mt-6 " />
          <div className="ui-pt-6 ui-px-6">
            <DistributionDisposalDownloadMemorandumButton />
          </div>
        </>
      )}
    </div>
  )
}

export default DistributionDisposalDetailStatus
