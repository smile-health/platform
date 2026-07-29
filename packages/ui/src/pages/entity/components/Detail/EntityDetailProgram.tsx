import { useState } from 'react'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { EmptyState } from '#components/empty-state'
import { ProgramItem } from '#components/modules/ProgramItem'
import { IconPrograms } from '#constants/program'
import cx from '#lib/cx'
import { TDetailEntity } from '#types/entity'
import { useTranslation } from 'react-i18next'

type TabType = 'logistik' | 'beneficiaries'

type Props = {
  entity?: TDetailEntity
}

export default function EntityDetailProgram({ entity }: Readonly<Props>) {
  const [tab, setTab] = useState<TabType>('logistik')
  const { t } = useTranslation(['common', 'entity'])
  const isShowBeneficiaries = useFeatureIsOn('feature.beneficiaries')

  const programs = entity?.programs ?? []
  const beneficiaries = entity?.beneficiaries ?? []

  const activeList = tab === 'beneficiaries' ? beneficiaries : programs

  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-gray-300 ui-rounded ui-space-y-4">
      <h5 className="ui-font-bold">Programs</h5>

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
                  ? 'entity:form.programs.logistics'
                  : 'entity:form.programs.beneficiary'
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
          title={t('common:message.empty.title')}
          description={t('common:message.empty.description')}
        />
      )}
    </div>
  )
}
