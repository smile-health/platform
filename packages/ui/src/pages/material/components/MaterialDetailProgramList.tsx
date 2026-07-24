import { ProgramItem } from '#components/modules/ProgramItem'
import { Skeleton } from '#components/skeleton'
import { IconPrograms } from '#constants/program'
import { MaterialDetailGlobalResponse } from '#services/material'

type MaterialDetailProgramListProps = Readonly<{
  data?: MaterialDetailGlobalResponse
  isLoading?: boolean
}>

export default function MaterialDetailProgramList({
  isLoading,
  data,
}: MaterialDetailProgramListProps) {
  if (isLoading) {
    return <Skeleton />
  }

  return (
    <div className="ui-p-4 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <h5 className="ui-font-bold">Programs</h5>
      <div className="ui-grid ui-grid-cols-4 ui-gap-4">
        {data?.programs?.map((item) => (
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
