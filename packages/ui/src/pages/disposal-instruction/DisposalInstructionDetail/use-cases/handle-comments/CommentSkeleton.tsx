import { Skeleton } from '#components/skeleton'

export const CommentSkeleton = () => (
  <div className="ui-space-y-4">
    <Skeleton className="ui-h-14 ui-bg-gray-200" />
    <Skeleton className="ui-h-14 ui-bg-gray-200" />
    <Skeleton className="ui-h-14 ui-bg-gray-200" />
  </div>
)
