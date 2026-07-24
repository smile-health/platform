import { Skeleton } from '#components/skeleton'

export default function ManufacturerLoading() {
  return (
    <div className="ui-p-4 ui-pb-4 ui-mt-6 ui-border ui-border-gray-300 ui-space-y-6 ui-rounded">
      <Skeleton className="ui-h-4 ui-w-40" />
      <Skeleton className="ui-h-8" />
      <Skeleton className="ui-h-8" />
      <Skeleton className="ui-h-8" />
      <Skeleton className="ui-h-8" />
    </div>
  )
}
