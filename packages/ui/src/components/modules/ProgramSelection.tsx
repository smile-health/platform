import { useMemo } from 'react'
import { Checkbox } from '#components/checkbox'
import { EmptyState } from '#components/empty-state'
import Check from '#components/icons/Check'
import Information from '#components/icons/Information'
import { InputSearch } from '#components/input'
import { ProgramItem } from '#components/modules/ProgramItem'
import { getProgramIconUrl } from '#constants/program'
import { useProgramInfiniteList } from '#hooks/useProgramInfiniteList'
import cx from '#lib/cx'
import { TProgram } from '#types/program'
import { useTranslation } from 'react-i18next'

import InfiniteScrollContainer from './InfiniteScrollContainer'

type BaseProps = {
  selected?: number[]
  onChange?: (selected: number[]) => void
  forbiddenUncheckIds?: number[]
  isMaterialHierarchyEnabled?: number
  withLayout?: boolean
  showInfo?: boolean
}

type WithApiEnabled = BaseProps & {
  isEnabledApi?: true
  programList?: TProgram[]
}

type WithoutApiEnabled = BaseProps & {
  isEnabledApi: false
  programList: TProgram[]
}

export type ProgramSelectionProps = WithApiEnabled | WithoutApiEnabled

export default function ProgramSelection({
  selected = [],
  onChange,
  forbiddenUncheckIds = [],
  isMaterialHierarchyEnabled,
  isEnabledApi = true,
  programList = [],
  withLayout = true,
  showInfo = true,
}: Readonly<ProgramSelectionProps>) {
  const { t } = useTranslation(['common'])

  const params = useMemo(
    () => ({
      ...(isMaterialHierarchyEnabled !== undefined && {
        is_hierarchy_enabled: Number(isMaterialHierarchyEnabled),
      }),
    }),
    [isMaterialHierarchyEnabled]
  )

  const { data, loading, hasMore, loadMore, keyword, setKeyword } =
    useProgramInfiniteList({
      params,
      isEnabled: isEnabledApi,
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
   * Active list based on source
   */
  const activeList = useMemo<TProgram[]>(() => {
    if (isEnabledApi) return data

    return filterByKeyword(programList ?? [], keyword)
  }, [isEnabledApi, data, programList, keyword])

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
              const isForbidden = forbiddenUncheckIds.includes(item.id)

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
                    icon={getProgramIconUrl(item)}
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
