import { Skeleton } from '#components/skeleton'

const MaterialDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="ui-h-8 ui-w-28" />
      <div className="ui-grid ui-grid-cols-4 ui-gap-4">
        <Skeleton className="ui-h-32 ui-w-full" />
        <Skeleton className="ui-h-32 ui-w-full" />
        <Skeleton className="ui-h-32 ui-w-full" />
        <Skeleton className="ui-h-32 ui-w-full" />
      </div>
      <Skeleton className="ui-h-6 ui-w-5/12" />
      <Skeleton className="ui-h-6 ui-w-5/12" />
      <Skeleton className="ui-h-6 ui-w-5/12" />
      <Skeleton className="ui-h-6 ui-w-5/12" />
      <Skeleton className="ui-h-6 ui-w-5/12" />
      <Skeleton className="ui-h-6 ui-w-5/12" />
      <Skeleton className="ui-h-6 ui-w-5/12" />
      <Skeleton className="ui-h-6 ui-w-5/12" />
      <Skeleton className="ui-h-6 ui-w-5/12" />
      <Skeleton className="ui-h-6 ui-w-5/12" />
    </div>
  )
}

export default MaterialDetailSkeleton
