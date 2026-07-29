import { useState } from 'react'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { EmptyState } from '#components/empty-state'
import { ProgramItem } from '#components/modules/ProgramItem'
import { IconPrograms } from '#constants/program'
import cx from '#lib/cx'
import { TUserDetail } from '#types/user'
import { useTranslation } from 'react-i18next'

import { getUserBeneficiaries, getUserPrograms } from '../../user.helper'
import UserSkeleton from '../UserSkeleton'

type TabType = 'logistik' | 'beneficiaries'

type Props = {
  data?: TUserDetail
  isLoading?: boolean
}

export default function UserDetailProgram({
  data,
  isLoading,
}: Readonly<Props>) {
  const [tab, setTab] = useState<TabType>('logistik')
  const { t } = useTranslation()
  const isShowBeneficiaries = useFeatureIsOn('feature.beneficiaries')

  const programs = getUserPrograms(data)
  const beneficiaries = getUserBeneficiaries(data)

  const activeList = tab === 'beneficiaries' ? beneficiaries : programs

  if (isLoading) return <UserSkeleton />

  return (
    <div className="ui-p-4 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <h5 className="ui-font-bold">{t('programs')}</h5>

      {/* Tabs */}
      {isShowBeneficiaries && (
        <div className="ui-flex ui-border-b ui-border-neutral-400">
          {(['logistik', 'beneficiaries'] as TabType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTab(type)}
              className={cx(
                'ui-flex-1 ui-py-2 ui-text-center ui-text-dark-blue',
                'focus:outline-none focus:ring-0',
                tab === type &&
                  'ui-font-semibold ui-border-b-[3px] ui-border-primary-500'
              )}
            >
              {t(
                type === 'logistik'
                  ? 'form.program.logistics'
                  : 'form.program.beneficiary'
              )}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      <div className="ui-min-h-[200px] ui-max-h-[500px] ui-overflow-y-auto">
        <div className="ui-grid ui-grid-cols-4 ui-gap-6">
          {activeList.map((item) => (
            <ProgramItem
              key={item.id}
              id={item.key}
              data={item}
              icon={IconPrograms[item.key]}
              className={{
                wrapper:
                  'ui-border ui-border-neutral-300 ui-rounded-lg ui-p-4 ui-gap-4 ui-cursor-default',
                title: 'ui-text-base ui-text-left',
              }}
            />
          ))}
        </div>
      </div>

      {activeList.length === 0 && (
        <EmptyState
          withIcon
          className="ui-h-[400px]"
          title={t('message.empty.title')}
          description={t('message.empty.description')}
        />
      )}
    </div>
  )
}
