import { InfiniteScrollList } from '#components/infinite-scroll-list'
import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'

import { useDisposalInstructionCreate } from '../../DisposalInstructionCreateContext'
import { useMaterialSelection } from './useMaterialSelection'

export const MaterialSelection = () => {
  const { t } = useTranslation([
    'disposalInstruction',
    'disposalInstructionCreate',
  ])

  const disposalInstructionCreate = useDisposalInstructionCreate()
  const materialSelection = useMaterialSelection()

  return materialSelection.enabled ? (
    <InfiniteScrollList
      id="material-list-selection"
      title={
        disposalInstructionCreate.form.methods.getValues('entity.label')
          ? `${t('disposalInstructionCreate:section.select_material.title_in_entity', { entity: disposalInstructionCreate.form.methods.getValues('entity.label') })}`
          : t('disposalInstructionCreate:section.select_material.title')
      }
      description={t(
        'disposalInstructionCreate:section.select_material.description'
      )}
      hasNextPage={materialSelection.query.hasNextPage}
      fetchNextPage={materialSelection.query.fetchNextPage}
      isLoading={materialSelection.query.isFetching}
      handleSearch={(keyword) => {
        materialSelection.searchMaterial(keyword)
        materialSelection.query.fetchNextPage({ cancelRefetch: true })
      }}
      onClickRow={(row) => materialSelection.selectMaterial(row)}
      data={materialSelection.table.data}
      totalItems={materialSelection.table.total}
      columns={materialSelection.table.columns}
      config={{
        searchBar: {
          show: true,
          placeholder: t(
            'disposalInstruction:field.search_material.placeholder'
          ),
        },
        totalItems: {
          show: true,
        },
      }}
    />
  ) : (
    <div
      className={cx(
        'ui-border ui-border-neutral-300 ui-rounded ui-p-6 space-y-4'
      )}
    >
      <div className={cx('ui-text-dark-blue ui-font-bold')}>
        {disposalInstructionCreate.form.methods.getValues('entity.label')
          ? `${t('disposalInstructionCreate:section.select_material.title_in_entity', { entity: disposalInstructionCreate.form.methods.getValues('entity.label') })}`
          : t('disposalInstructionCreate:section.select_material.title')}
      </div>
      <div className={cx('ui-text-gray-500')}>
        {t('disposalInstructionCreate:section.select_material.instruction')}
      </div>
    </div>
  )
}
