import React, { useContext } from 'react'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import DistributionDisposalDetailContext from '../utils/distribution-disposal-detail.context'

import 'dayjs/locale/en'
import 'dayjs/locale/id'

const DistributionDisposalDetailBox = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'distributionDisposal'])
  const { data } = useContext(DistributionDisposalDetailContext)
  return (
    <div className="ui-flex ui-gap-3">
      <div className="ui-border ui-rounded ui-p-6 ui-flex-1 ui-space-y-3 ui-border-neutral-300">
        <p className="ui-text-dark-teal ui-font-semibold">
          {t('common:details')}
        </p>
        <RenderDetailValue
          showColon={false}
          className="ui-grid-cols-[200px_1fr]"
          loading={!data}
          data={[
            {
              label: t('distributionDisposal:detail.info.no', {
                no: '',
              }),
              value: (
                <div className="ui-text-dark-teal ui-font-bold">
                  : {`KPM-${data?.id ?? t('common:empty')}`}
                </div>
              ),
            },
            {
              label: t('distributionDisposal:detail.info.created_at'),
              value: (
                <div className="ui-text-dark-teal ui-font-bold">
                  :{' '}
                  {data?.created_at
                    ? dayjs(data.created_at)
                        .locale(language)
                        .format('DD MMM YYYY HH:mm')
                        ?.toUpperCase()
                    : '-'}
                </div>
              ),
            },
            {
              label: t('common:created_by'),
              value: (
                <div className="ui-text-dark-teal ui-font-bold">
                  :{' '}
                  {data?.user_created_by
                    ? `${data.user_created_by?.firstname ?? ''} ${data.user_created_by?.lastname ?? ''}`
                    : '-'}
                </div>
              ),
            },
            {
              label: t('common:menu.setting.item.activity'),
              value: (
                <div className="ui-text-dark-teal ui-font-bold">
                  : {data?.activity?.name ?? '-'}
                </div>
              ),
            },
            {
              label: t('distributionDisposal:detail.info.no_memorandum'),
              value: (
                <div className="ui-text-dark-teal ui-font-bold">
                  : {data?.no_document ?? '-'}
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}

export default DistributionDisposalDetailBox
