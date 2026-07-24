import { Skeleton } from '#components/skeleton'

export default function TestMethodSkeleton() {
  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
        <Skeleton className="ui-h-6 ui-w-24" />
        <Skeleton className="ui-h-10 ui-w-24" />
      </div>
      <div className="ui-space-y-3">
        <Skeleton className="ui-h-4 ui-w-32" />
        <Skeleton className="ui-h-6 ui-w-48" />
      </div>
    </div>
  )
}
