import { useContext } from 'react'
import Link from 'next/link'
import { Button } from '#components/button'
import Download from '#components/icons/Download'
import Import from '#components/icons/Import'
import Plus from '#components/icons/Plus'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import ProgramPlanDetailContext from '../../program-plan/list/libs/program-plan-detail.context'
import { TProgramPlanData } from '../../program-plan/list/libs/program-plan-list.type'

const isAllowMutate = (detailProgramPlanData: TProgramPlanData | null) => {
  if (
    !detailProgramPlanData ||
    !hasPermission('task-mutate') ||
    detailProgramPlanData.is_final
  ) {
    return false
  }

  return true
}

export const AddTaskButton = ({ href }: { href: string }) => {
  const { t } = useTranslation(['common', 'task'])
  const { detailProgramPlanData } = useContext(ProgramPlanDetailContext)

  if (!isAllowMutate(detailProgramPlanData)) return null

  return (
    <Button asChild leftIcon={<Plus className="ui-size-5" />}>
      <Link href={href}>{t('task:add')}</Link>
    </Button>
  )
}

export const ImportTaskButton = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation(['common', 'task'])
  const { detailProgramPlanData } = useContext(ProgramPlanDetailContext)

  if (!isAllowMutate(detailProgramPlanData)) return null

  return (
    <Button
      data-testid="btn-import"
      variant="subtle"
      type="button"
      leftIcon={<Import className="ui-size-5" />}
      onClick={onClick}
    >
      {t('import')}
    </Button>
  )
}

export const DownloadTemplateTaskButton = ({
  onClick,
}: {
  onClick: () => void
}) => {
  const { t } = useTranslation(['common', 'task'])
  const { detailProgramPlanData } = useContext(ProgramPlanDetailContext)

  if (!isAllowMutate(detailProgramPlanData)) return null

  return (
    <Button
      data-testid="btn-download-template"
      variant="subtle"
      type="button"
      className="ui-w-max"
      leftIcon={<Download className="ui-size-5" />}
      onClick={onClick}
    >
      {t('download_template')}
    </Button>
  )
}
