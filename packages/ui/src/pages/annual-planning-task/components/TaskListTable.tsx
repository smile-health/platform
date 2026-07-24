import { useContext } from 'react'
import { DataTable } from '#components/data-table'
import useSmileRouter from '#hooks/useSmileRouter'
import { Task } from '#types/task'
import { useTranslation } from 'react-i18next'

import ProgramPlanDetailContext from '../../program-plan/list/libs/program-plan-detail.context'
import { columnsListTask } from '../constants/table'

type TaskListTableProps = {
  data: Task[]
  page: number
  paginate: number
  programPlanId: number
  isLoading: boolean
  onClickDelete: (task: Task) => void
  onClickDetailCoverage: (task: Task) => void
}

export default function TaskListTable({
  data,
  page,
  paginate,
  programPlanId,
  isLoading,
  onClickDetailCoverage,
  onClickDelete,
}: Readonly<TaskListTableProps>) {
  const { detailProgramPlanData } = useContext(ProgramPlanDetailContext)
  const { t, i18n } = useTranslation(['common', 'task'])
  const router = useSmileRouter()

  return (
    <DataTable
      data={data}
      columns={columnsListTask({
        t,
        page,
        size: paginate,
        programPlanId,
        detailProgramPlanData,
        lang: i18n.language,
        setLink: router.getAsLink,
        onClickDetailCoverage,
        onClickDelete,
      })}
      isLoading={isLoading}
    />
  )
}
