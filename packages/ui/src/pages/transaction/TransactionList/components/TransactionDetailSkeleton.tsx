import React from 'react'
import { Skeleton } from '#components/skeleton'

export default function TransactionDetailSkeleton() {
  return (
    <div className="ui-space-y-4">
      <Skeleton className="ui-h-12" />

      <div className="ui-gap-4 flex">
        <Skeleton className="ui-h-12 ui-w-full" />
        <Skeleton className="ui-h-12 ui-w-full" />
        <Skeleton className="ui-h-12 ui-w-full" />
      </div>

      <Skeleton className="ui-h-32" />
      <Skeleton className="ui-h-32" />
      <Skeleton className="ui-h-32" />
      <Skeleton className="ui-h-32" />
    </div>
  )
}
