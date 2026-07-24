import { useMemo, useState } from 'react'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { Checkbox } from '#components/checkbox'
import { EmptyState } from '#components/empty-state'
import Check from '#components/icons/Check'
import Information from '#components/icons/Information'
import { InputSearch } from '#components/input'
import { ProgramItem } from '#components/modules/ProgramItem'
import { IconPrograms, ProgramWasteManagement } from '#constants/program'
import { useProgramInfiniteList } from '#hooks/useProgramInfiniteList'
import cx from '#lib/cx'
import { TProgram } from '#types/program'
import { getAuthTokenCookies } from '#utils/storage/auth'
import { useTranslation } from 'react-i18next'

import InfiniteScrollContainer from './InfiniteScrollContainer'

type TabType = 'logistik' | 'beneficiaries'

type BaseProps = {
  selected?: number[]
  onChange?: (selected: number[]) => void
  forbiddenUncheckIds?: number[]
  forbiddenUncheckBeneficiariesIds?: number[]
  isMaterialHierarchyEnabled?: number
  withLayout?: boolean
  showWms?: boolean
  hideTabs?: boolean
  showInfo?: boolean
}

type WithApiEnabled = BaseProps & {
  isEnabledApi?: true
  programList?: TProgram[]
  beneficiariesList?: TProgram[]
}

type WithoutApiEnabled = BaseProps & {
  isEnabledApi: false
  programList: TProgram[]
  beneficiariesList?: TProgram[]
}

export type ProgramSelectionProps = WithApiEnabled | WithoutApiEnabled

export default function ProgramSelection({
  selected = [],
  onChange,
  forbiddenUncheckIds = [],
  forbiddenUncheckBeneficiariesIds = [],
  isMaterialHierarchyEnabled,
  isEnabledApi = true,
  programList = [],
  beneficiariesList = [],
  withLayout = true,
  showWms = false,
  hideTabs = false,
  showInfo = true,
}: Readonly<ProgramSelectionProps>) {
  const [tab, setTab] = useState<TabType>('logistik')

  const token = getAuthTokenCookies()
  const { t } = useTranslation(['common'])
  const isShowBeneficiaries = useFeatureIsOn('feature.beneficiaries')

  const { data, loading, hasMore, loadMore, keyword, setKeyword } =
    useProgramInfiniteList({
      params: {
        ...(isMaterialHierarchyEnabled !== undefined && {
          is_hierarchy_enabled: Number(isMaterialHierarchyEnabled),
        }),
      },
      isEnabled: isEnabledApi,
      showWms,
    })

  /**
   * Filter helpers
   */
  const filterByKeyword = (list: TProgram[], keyword: string) =>
    keyword
      ? list.filter((item) =>
          item?.name?.toLowerCase().includes(keyword.toLowerCase())
        )
      : list

  /**
   * Active list based on tab & source
   */
  const activeList = useMemo<TProgram[]>(() => {
    if (isEnabledApi) return data

    const wmsProgram = showWms && token ? ProgramWasteManagement() : null

    const baseList = tab === 'beneficiaries' ? beneficiariesList : programList

    const mergedList = wmsProgram
      ? [wmsProgram, ...(baseList ?? [])]
      : (baseList ?? [])

    return filterByKeyword(mergedList, keyword)
  }, [
    isEnabledApi,
    data,
    tab,
    programList,
    beneficiariesList,
    keyword,
    token,
    showWms,
  ])

  const selectProgram = (id: number) => {
    onChange?.([...selected, id])
  }

  const unselectProgram = (id: number) => {
    onChange?.(selected.filter((val) => val !== id))
  }

  return (
    <div
      className={cx(
        withLayout && 'ui-p-4 ui-border ui-border-neutral-300 ui-rounded'
      )}
    >
      {withLayout && (
        <div className="ui-mb-4 ui-font-bold">{t('form.program.title')}</div>
      )}

      <div className="ui-flex ui-flex-col ui-space-y-5">
        {/* Info */}
        {showInfo && (
          <div className="ui-flex ui-gap-2 ui-bg-slate-100 ui-p-4 ui-text-xs ui-text-dark-blue ui-rounded">
            <Information />
            <p>{t('form.program.information')}</p>
          </div>
        )}

        {/* Tabs */}
        {!hideTabs && isShowBeneficiaries && (
          <div className="ui-flex ui-border-b ui-border-neutral-400 ui-bg-blue-100">
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

        {/* Search */}
        <InputSearch
          data-testid="input-search-workspace"
          placeholder={t('form.program.placeholder.name')}
          value={keyword}
          onInput={(e) => setKeyword(e.currentTarget.value)}
        />

        {/* List */}
        <InfiniteScrollContainer
          key={isMaterialHierarchyEnabled}
          hasMore={hasMore}
          loadMore={loadMore}
          loading={loading}
        >
          <div className="ui-space-y-2">
            {activeList.map((item) => {
              const isChecked = selected.includes(item.id)
              const isForbidden =
                forbiddenUncheckIds.includes(item.id) ||
                forbiddenUncheckBeneficiariesIds.includes(item.id)

              return (
                <button
                  key={item.key}
                  type="button"
                  data-testid={`btn-workspace-${item.key}`}
                  className={cx(
                    'ui-flex ui-gap-4 ui-items-center ui-rounded-lg ui-p-4 w-full focus:outline-none',
                    {
                      'ui-bg-slate-100 ui-justify-between': isForbidden,
                      'ui-border ui-border-neutral-300':
                        !isChecked && !isForbidden,
                      'ui-border ui-border-[#004990] ui-bg-[#E2F3FC]':
                        isChecked && !isForbidden,
                    }
                  )}
                  onClick={() => {
                    if (isForbidden) return

                    if (isChecked) {
                      unselectProgram(item.id)
                    } else {
                      selectProgram(item.id)
                    }
                  }}
                >
                  {!isForbidden && (
                    <Checkbox
                      id={`cbx-program-${item.key}`}
                      checked={isChecked}
                    />
                  )}

                  <ProgramItem
                    id={item.key}
                    data={item}
                    disabled={isForbidden}
                    icon={IconPrograms[item.key]}
                    sizeIcon={40}
                    className={{
                      wrapper: 'ui-gap-4',
                      title: 'ui-text-left',
                    }}
                  />

                  {isForbidden && (
                    <div className="ui-flex ui-items-center ui-gap-2">
                      <p className="ui-text-sm ui-text-neutral-500">
                        {t('selected')}
                      </p>
                      <Check className="ui-size-5" />
                    </div>
                  )}
                </button>
              )
            })}

            {activeList.length === 0 && (
              <EmptyState
                withIcon
                className="ui-h-[480px]"
                title={t('common:message.empty.title')}
                description={t('common:message.empty.description')}
              />
            )}
          </div>
        </InfiniteScrollContainer>
      </div>
    </div>
  )
}
