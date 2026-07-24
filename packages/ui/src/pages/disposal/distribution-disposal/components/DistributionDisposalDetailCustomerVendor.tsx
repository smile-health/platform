import React, { useContext } from 'react'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import { useTranslation } from 'react-i18next'

import DistributionDisposalDetailContext from '../utils/distribution-disposal-detail.context'

const DistributionDisposalDetailCustomerVendor = () => {
  const { t } = useTranslation(['common', 'distributionDisposal'])
  const { data } = useContext(DistributionDisposalDetailContext)
  return (
    <div className="ui-flex ui-gap-3">
      <div className="ui-border ui-rounded ui-p-6 ui-flex-1 ui-space-y-3 ui-border-neutral-300">
        <p className="ui-text-dark-teal ui-font-semibold">
          {t('distributionDisposal:detail.customer_vendor.vendor.title')}
        </p>
        <RenderDetailValue
          showColon={false}
          className="ui-grid-cols-[200px_1fr]"
          loading={!data}
          data={[
            {
              label: t(
                'distributionDisposal:detail.customer_vendor.vendor.name'
              ),
              value: (
                <div className="ui-text-dark-teal">
                  {data?.vendor?.name ?? '-'}
                </div>
              ),
            },
            {
              label: t('distributionDisposal:detail.address'),
              value: (
                <div className="ui-text-dark-teal">
                  {data?.vendor?.address ?? '-'}
                </div>
              ),
            },
          ]}
        />
      </div>
      <div className="ui-border ui-rounded ui-p-6 ui-flex-1 ui-space-y-3 ui-border-neutral-300">
        <p className="ui-text-dark-teal ui-font-semibold">
          {t('distributionDisposal:detail.customer_vendor.customer.title')}
        </p>
        <RenderDetailValue
          showColon={false}
          className="ui-grid-cols-[200px_1fr]"
          loading={!data}
          data={[
            {
              label: t(
                'distributionDisposal:detail.customer_vendor.customer.name'
              ),
              value: (
                <div className="ui-text-dark-teal">
                  {data?.customer?.name ?? '-'}
                </div>
              ),
            },
            {
              label: t('distributionDisposal:detail.address'),
              value: (
                <div className="ui-text-dark-teal">
                  {data?.customer?.address ?? '-'}
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}

export default DistributionDisposalDetailCustomerVendor
