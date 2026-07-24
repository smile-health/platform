import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { InputSearch } from '#components/input'
import { Coverage, Task } from '#types/task'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import useDetailCoverage from '../hooks/useDetailCoverage'

const columns = (t: TFunction<['common', 'task']>): ColumnDef<Coverage>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    size: 40,
    minSize: 40,
    cell: ({ row: { index } }) => index + 1,
  },
  {
    header: t('task:coverage.province.name'),
    accessorKey: 'province_name',
  },
  {
    header: t('task:list.columns.target_coverage'),
    accessorKey: 'coverage_number',
    cell: ({ row: { original } }) => `${original.coverage_number}%`,
  },
]

type DetailCoverageModalProps = {
  open: boolean
  handleClose: () => void
  task: Task
}

export default function DetailCoverageModal({
  open,
  handleClose,
  task,
}: DetailCoverageModalProps) {
  const { t } = useTranslation(['common', 'task'])
  const {
    coverage,
    isFetchingDetailCoverage,
    keywordProvince,
    setKeywordProvince,
  } = useDetailCoverage(task)

  return (
    <Dialog open={open} onOpenChange={handleClose} size="lg">
      <DialogCloseButton />
      <DialogHeader>
        <h3 className="ui-text-center ui-text-[20px] ui-font-semibold">
          {t('task:coverage.title')}
        </h3>
      </DialogHeader>
      <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
      <DialogContent className="ui-overflow-auto ui-my-[8px] ui-px-0">
        <div>
          <div className="ui-grid ui-grid-cols-[1fr_2fr] ui-gap-6 ui-px-6">
            <div className="ui-space-y-1">
              <h4 className="ui-text-sm ui-leading-5 ui-text-neutral-500">
                {t('task:list.columns.group_target')}:
              </h4>
              <h5 className="ui-text-base ui-leading-5 ui-text-[#0C3045] ui-font-bold">
                {task.target_group.name}
              </h5>
            </div>
            <div className="ui-space-y-1">
              <h4 className="ui-text-sm ui-leading-5 ui-text-neutral-500">
                {t('task:list.columns.number_of_doses')}:
              </h4>
              <h5 className="ui-text-base ui-leading-5 ui-text-[#0C3045] ui-font-bold">
                {task.number_of_dose}
              </h5>
            </div>
          </div>
        </div>
        <div className="ui-mt-4 ui-border-t ui-border-neutral-300 ui-py-4 ui-px-6 ui-grid ui-grid-cols-[1fr_2fr] ui-gap-6 ui-items-center">
          <h5 className="ui-text-base ui-leading-5 ui-text-[#0C3045] ui-font-bold">
            {t('task:coverage.province.list')}
          </h5>
          <InputSearch
            placeholder={t('task:coverage.province.placeholder')}
            value={keywordProvince}
            onChange={(e) => setKeywordProvince(e.target.value)}
          />
        </div>
        <div className="ui-px-6 ui-pb-4 ui-border-b ui-border-neutral-300">
          <DataTable
            data={coverage}
            columns={columns(t)}
            isLoading={isFetchingDetailCoverage}
          />
        </div>
      </DialogContent>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={handleClose}
          className="ui-w-full"
          type="button"
        >
          {t('common:cancel')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
