import React, { Fragment } from 'react'
import { Skeleton } from '#components/skeleton'

function AnalysisParameterSkeleton() {
  return (
    <Fragment>
      <div className="ui-mt-6">
        <div className="ui-max-w-form ui-mx-auto ui-p-4 ui-pb-4 ui-border ui-border-gray-300 ui-space-y-4 ui-rounded">
          <Skeleton className="ui-h-6 ui-w-[200px]" />
          <Skeleton className="ui-h-4 ui-w-[100px]" />
          <Skeleton className="ui-h-10 ui-w-full" />
          <Skeleton className="ui-h-4 ui-w-[100px]" />
          <Skeleton className="ui-h-10 ui-w-full" />
          <Skeleton className="ui-h-4 ui-w-[100px]" />
          <Skeleton className="ui-h-10 ui-w-full" />
        </div>
      </div>
      <div className="ui-max-w-form ui-mx-auto ui-flex ui-justify-end ui-gap-4 ui-mt-6">
        <Skeleton className="ui-h-10 ui-w-32" />
        <Skeleton className="ui-h-10 ui-w-32" />
      </div>
    </Fragment>
  )
}

export default AnalysisParameterSkeleton
