import React, { Fragment } from 'react'
import { Skeleton } from '#components/skeleton'

function ActivitySkeleton() {
  return (
    <Fragment>
      <div className="ui-p-4 ui-pb-4 ui-mt-6 ui-border ui-border-gray-300 ui-space-y-4 ui-rounded">
        <div className="ui-flex ui-justify-end">
          <Skeleton className="ui-h-10 ui-w-[150px]" />
        </div>
        <Skeleton className="ui-h-4 ui-w-[200px]" />
        <Skeleton className="ui-h-10 ui-w-1/2" />
        <Skeleton className="ui-h-10 ui-w-1/2" />
      </div>
      <div className="ui-flex ui-justify-end ui-gap-4 ui-mt-6">
        <Skeleton className="ui-h-10 ui-w-32" />
        <Skeleton className="ui-h-10 ui-w-32" />
      </div>
    </Fragment>
  )
}

export default ActivitySkeleton
