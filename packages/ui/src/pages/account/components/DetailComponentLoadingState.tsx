import React from 'react'
import { Skeleton } from '#components/skeleton'

import { TFields } from './DetailComponent'

export type DetailComponentProps = {
  fields?: TFields
  amount?: number
  id?: string
}

const DEFAULT_SKELETON_AMOUNT = 3

export default function DetailComponentLoadingState({
  fields,
  amount,
  id,
}: Readonly<DetailComponentProps>) {
  return (
    <div>
      <div className="border rounded ui-border-[#d2d2d2] mt-6 p-4" id={id}>
        {fields?.showLatestLoginInfo && (
          <div className="flex justify-start space-x-1">
            <div>
              <Skeleton className="ui-h-[24px] ui-w-[20px] mb-5" />
            </div>
            <div className="text-label-dark">
              <Skeleton className="ui-h-[24px] ui-w-[355px] mb-5" />
            </div>
          </div>
        )}
        <div className="flex justify-end space-x-3">
          {fields?.buttons &&
            Array.from({ length: fields?.buttons.length }, (_, i) => i + 1).map(
              (_, index) => {
                return (
                  <Skeleton key={index + 1} className="ui-h-[40px] mb-5 w-40" />
                )
              }
            )}
        </div>

        <div className="mb-4 font-bold">
          <Skeleton className="ui-h-[24px] ui-w-[355px] mb-5" />
        </div>

        {(fields?.fields || amount) &&
          Array.from(
            {
              length:
                fields?.fields?.length ?? amount ?? DEFAULT_SKELETON_AMOUNT,
            },
            (_, i) => i + 1
          ).map((_, index) => {
            return (
              <Skeleton key={index + 1} className="ui-h-[24px] ui-w-3/4 mb-5" />
            )
          })}
      </div>
    </div>
  )
}
