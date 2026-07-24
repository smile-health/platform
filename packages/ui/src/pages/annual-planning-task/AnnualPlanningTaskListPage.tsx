import { Button } from '#components/button'
import {
  FilterFormBody,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
} from '#components/filter'
import Export from '#components/icons/Export'
import Meta from '#components/layouts/Meta'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { ModalImport } from '#components/modules/ModalImport'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { usePermission } from '#hooks/usePermission'
import useSmileRouter from '#hooks/useSmileRouter'
import ProgramPlanListDetailContainer from '#pages/program-plan/list/components/ProgramPlanListDetailContainer'
import { useTranslation } from 'react-i18next'

import {
  AddTaskButton,
  DownloadTemplateTaskButton,
  ImportTaskButton,
} from './components/AnnualPlanningTaskButton'
import DetailCoverageModal from './components/DetailCoverageModal'
import TaskListTable from './components/TaskListTable'
import useDeleteTask from './hooks/useDeleteTask'
import useDownloadTask from './hooks/useDownloadTask'
import useExportTask from './hooks/useExportTask'
import useImportTask from './hooks/useImportTask'
import useListTask from './hooks/useListTask'
import { useAnnualPlanningEnabled } from '#hooks/useAnnualPlanningEnabled'
import Container from '#components/layouts/PageContainer'

export default function AnnualPlanningTaskListPage() {
  usePermission('task-view')
  const { isDisabledAnnual } = useAnnualPlanningEnabled()
  if (isDisabledAnnual) return <Container title="" withLayout />

  const {
    programPlanId,
    filter,
    page,
    paginate,
    dataListTask,
    isFetchingListTask,
    selectedTask,
    handleChangePage,
    handleChangePaginate,
    setSelectedTask,
  } = useListTask()
  const { handleExport } = useExportTask()
  const { showImport, setShowImport, handleImport } = useImportTask()
  const { downloadTemplate } = useDownloadTask()
  const { showDelete, setShowDelete, handleDeleteTask, handleDeleteButton } =
    useDeleteTask()

  const { t } = useTranslation(['common', 'task'])
  const router = useSmileRouter()

  return (
    <ProgramPlanListDetailContainer>
      <Meta title={`SMILE | ${t('task:title')}`} />

      <ModalImport
        open={showImport}
        setOpen={setShowImport}
        onSubmit={handleImport}
        handleClose={() => setShowImport(false)}
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        description={t('task:import.description')}
      />

      <ModalConfirmation
        type="delete"
        description={t('task:delete.description')}
        open={showDelete}
        setOpen={setShowDelete}
        onSubmit={handleDeleteTask}
      />

      {selectedTask && (
        <DetailCoverageModal
          open={Boolean(selectedTask)}
          handleClose={() => setSelectedTask(null)}
          task={selectedTask}
        />
      )}

      <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
        <h5 className="ui-font-bold ui-text-xl">{t('task:title')}</h5>
        <AddTaskButton
          href={router.getAsLink(`/v5/program-plan/${programPlanId}/task/add`)}
        />
      </div>

      <div className="mt-6 space-y-6">
        <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-flex ui-items-end ui-gap-4">
            <div className="ui-grid ui-grid-cols-2 ui-w-full ui-gap-3">
              {filter.renderField()}
            </div>
            <div className="ui-space-x-3 ui-flex ui-mt-5">
              <ImportTaskButton onClick={() => setShowImport(true)} />
              <Button
                data-testid="btn-export"
                variant="subtle"
                type="button"
                leftIcon={<Export className="ui-size-5" />}
                onClick={() => handleExport(filter.query)}
              >
                {t('export')}
              </Button>
              <DownloadTemplateTaskButton onClick={() => downloadTemplate()} />
              <span className="ui-h-auto ui-w-px ui-bg-neutral-300" />
              <FilterResetButton variant="subtle" onClick={filter.reset} />
              <FilterSubmitButton
                className="ui-w-[200px]"
                variant="outline"
                onClick={() => handleChangePage(1)}
              />
            </div>
          </FilterFormBody>
        </FilterFormRoot>
        <div className="ui-space-y-6 ui-my-5 ui-rounded">
          <TaskListTable
            data={dataListTask?.data || []}
            isLoading={isFetchingListTask}
            page={page}
            paginate={paginate}
            programPlanId={programPlanId}
            onClickDetailCoverage={setSelectedTask}
            onClickDelete={handleDeleteButton}
          />

          <PaginationContainer className="ui-mt-5">
            <PaginationSelectLimit
              size={paginate}
              perPagesOptions={dataListTask?.list_pagination}
              onChange={handleChangePaginate}
            />
            <PaginationInfo
              size={paginate}
              currentPage={page}
              total={dataListTask?.total_item}
            />
            <Pagination
              totalPages={dataListTask?.total_page ?? 0}
              currentPage={page}
              onPageChange={handleChangePage}
            />
          </PaginationContainer>
        </div>
      </div>
    </ProgramPlanListDetailContainer>
  )
}
