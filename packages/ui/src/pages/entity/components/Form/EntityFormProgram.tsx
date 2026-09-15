import { useParams } from 'next/navigation'
import { EmptyState } from '#components/empty-state'
import Warning from '#components/icons/Warning'
import { InputSearch } from '#components/input'
import InfiniteScrollContainer from '#components/modules/InfiniteScrollContainer'
import { useProgramInfiniteList } from '#hooks/useProgramInfiniteList'
import { TDetailEntity } from '#types/entity'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { TFormData } from '../../hooks/useEntityForm'
import ProgramItemWrapper from './ProgramItemWrapper'

type Props = Readonly<{
  data: TDetailEntity | undefined
  programs: number[]
}>

export default function EntityFormProgram({ programs }: Props) {
  const { t } = useTranslation(['common', 'entity'])
  const { id } = useParams() ?? {}

  const { control } = useFormContext<TFormData>()

  const { data, loading, hasMore, loadMore, keyword, setKeyword } =
    useProgramInfiniteList()

  return (
    <div className="ui-p-4 ui-border ui-border-neutral-300 ui-rounded">
      {/* Header */}
      <div className="ui-flex ui-flex-col ui-gap-4">
        <div className="ui-font-bold">Programs</div>

        <div className="ui-flex ui-items-center ui-gap-2 ui-rounded ui-bg-slate-100 ui-px-4 ui-py-[9px]">
          <Warning />
          <p className="ui-text-xs">{t('entity:form.programs.description')}</p>
        </div>

        {/* Search */}
        <InputSearch
          placeholder={t('entity:form.programs.search')}
          defaultValue={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* Program List */}
      <Controller
        name="program_ids"
        control={control}
        render={({ field: { onChange, value } }) => (
          <InfiniteScrollContainer
            hasMore={hasMore}
            loadMore={loadMore}
            loading={loading}
          >
            <div className="ui-grid ui-grid-cols-1 ui-gap-2 ui-mt-4">
              {data?.map((item) => {
                if (!item) return null

                const itemId = item.id ?? -1

                const isChecked = value?.includes(itemId)
                const isAlreadySelected = !!id && programs.includes(itemId)

                const disabled = isAlreadySelected

                return (
                  <ProgramItemWrapper
                    key={itemId}
                    item={item}
                    value={value}
                    isChecked={isChecked}
                    disabled={disabled}
                    onChange={onChange}
                  />
                )
              })}

              {data?.length === 0 && (
                <EmptyState
                  withIcon
                  className="ui-h-[480px]"
                  title={t('common:message.empty.title')}
                  description={t('common:message.empty.description')}
                />
              )}
            </div>
          </InfiniteScrollContainer>
        )}
      />
    </div>
  )
}
