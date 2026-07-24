import { ProgramItem } from '#components/modules/ProgramItem'
import { IconPrograms } from '#constants/program'

import { BudgetSourceDetailWorkspaceProps } from '../budget-source.type'
import BudgetSourceSkeleton from './BudgetSourceSkeleton'

export default function BudgetSourceDetailWorkspace({
  isLoading,
  data,
  t,
}: Readonly<BudgetSourceDetailWorkspaceProps>) {
  const programs = data?.programs
  if (isLoading) {
    return <BudgetSourceSkeleton />
  }

  return (
    <div className="ui-p-4 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <h5 className="ui-font-bold">{t('budgetSource:form.program.title')}</h5>
      <div className="ui-grid ui-grid-cols-4 ui-gap-4">
        {programs?.map((item) => (
          <ProgramItem
            id={item?.key}
            key={item?.id}
            data={item}
            className={{
              wrapper:
                'ui-gap-4 ui-p-4 ui-rounded-lg ui-border ui-border-neutral-300',
              title: 'ui-text-left'
            }}
            icon={IconPrograms[item.key]}
          />
        ))}
      </div>
    </div>
  )
}
