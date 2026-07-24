import { useRouter } from 'next/router'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import {
  FilterFormBody,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
} from '#components/filter'
import Export from '#components/icons/Export'
import HourGlass from '#components/icons/HourGlass'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import ActiveLabel from '#components/modules/ActiveLabel'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { Skeleton } from '#components/skeleton'
import { usePermission } from '#hooks/usePermission'
import { useTranslation } from 'react-i18next'

import { EmptyState } from './components/EmptyState'
import { columnsDetailPopulation } from './constants/table'
import useActivatePopulation from './hooks/useActivatePopulation'
import useDetailPopulation from './hooks/useDetailPopulation'

export default function DetailPopulationPage() {
  usePermission('population-global-view')

  const {
    year,
    filter,
    isFilterActive,
    isFetchingDetailPopulation,
    dataDetailPopulation,
    targetGroups,
    handleExportPopulation,
  } = useDetailPopulation(true)

  const {
    isActivePopulation,
    isFetchingActivePopulation,
    openConfirmPopulation,
    setOpenConfirmPopulation,
    handleActivatePopulation,
  } = useActivatePopulation()

  const { t, i18n } = useTranslation(['common', 'population'])
  const router = useRouter()

  return (
    <Container
      title={`${t('population:title')} ${year}`}
      withLayout
      backButton={{
        label: t('common:back_to_list'),
        show: true,
        onClick: () => {
          router.push(`/${i18n.language}/v5/global-settings/population`)
        },
      }}
    >
      <Meta title={t('population:title')} />

      <ModalConfirmation
        open={openConfirmPopulation}
        setOpen={setOpenConfirmPopulation}
        onSubmit={handleActivatePopulation}
        description={t('population:active.confirmation.description')}
      />

      {isFetchingActivePopulation ? (
        <Skeleton className="ui-h-14 ui-w-full" />
      ) : (
        <div className="ui-border ui-border-gray-300 ui-rounded ui-mt-6 ui-py-4 ui-px-6 ui-flex ui-justify-between ui-items-center">
          <div className="ui-flex ui-items-center ui-gap-2">
            <p className="ui-text-base ui-text-[#787878]">Status: </p>
            <ActiveLabel isActive={isActivePopulation} />
          </div>
          {!isActivePopulation && (
            <Button
              variant="outline"
              color="success"
              onClick={() => setOpenConfirmPopulation(true)}
            >
              {t('common:status.activate')}
            </Button>
          )}
        </div>
      )}

      <div className="mt-6">
        <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-flex ui-items-end">
            <div className="ui-w-full">{filter.renderField()}</div>
            <div className="ui-flex ui-gap-2">
              <Button
                id="btn-export"
                variant="subtle"
                type="button"
                leftIcon={<Export className="ui-size-5" />}
                onClick={() => handleExportPopulation()}
                className="ui-w-[120px]"
              >
                {t('common:export')}
              </Button>
              <span className="ui-h-auto ui-w-px ui-bg-neutral-300" />
              <FilterResetButton variant="subtle" onClick={filter.reset} />
              <FilterSubmitButton className="ui-w-[200px]" variant="outline" />
            </div>
          </FilterFormBody>
        </FilterFormRoot>

        <div className="ui-space-y-6 ui-my-5 ui-rounded">
          <DataTable
            key={filter.query.province?.value || 0}
            firstRowClassName="ui-bg-[#EFF7FF]"
            data={dataDetailPopulation?.data}
            columns={columnsDetailPopulation({ t, targetGroups })}
            isLoading={isFetchingDetailPopulation}
            className="ui-overflow-x-auto"
            customEmptyComponent={
              !isFilterActive && (
                <EmptyState
                  emptyIcon={<HourGlass className="ui-size-6" />}
                  title={t('population:empty.no_filter.title')}
                  description={t('population:empty.no_filter.description')}
                />
              )
            }
          />
        </div>
      </div>
    </Container>
  )
}
