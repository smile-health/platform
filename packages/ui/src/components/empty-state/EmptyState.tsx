import React, { ReactNode } from 'react'
import DotsHorizontal from '#components/icons/DotsHorizontal'
import cx from '#lib/cx'

type EmptyStateProps = {
  title?: string
  description?: string
  secondaryAction?: ReactNode
  primaryAction?: ReactNode
  withIcon?: boolean
  className?: string
  emptyIcon?: ReactNode
}
export function EmptyState({
  title,
  description,
  secondaryAction,
  primaryAction,
  withIcon,
  className,
  emptyIcon,
}: Readonly<EmptyStateProps>) {
  return (
    <div
      className={cx(
        'ui-flex ui-h-full ui-w-full ui-flex-col ui-items-center ui-justify-center ui-p-5 ui-bg-white',
        className
      )}
    >
      {withIcon ? (
        <div className="ui-flex ui-h-16 ui-w-16 ui-items-center ui-justify-center ui-rounded-full ui-bg-[#F4F4F5]">
          <div className="ui-flex ui-h-12 ui-w-12 ui-items-center ui-justify-center ui-rounded-full ui-bg-[#E4E4E7]">
            {emptyIcon ?? <DotsHorizontal className="ui-size-6"></DotsHorizontal>}
          </div>
        </div>
      ) : null}

      <div className="ui-mt-3 ui-flex ui-flex-col ui-items-center ui-space-y-1">
        <div className="ui-font-semibold ui-text-dark-blue ui-text-[16px]">
          {title}
        </div>
        <div className="ui-text-center ui-text-neutral-500 ui-max-w-[352px] ui-text-[14px]">
          {description}
        </div>
      </div>
      {secondaryAction || primaryAction ? (
        <div className="ui-mt-5">
          <div className="ui-flex ui-flex-wrap ui-items-center ui-justify-center ui-gap-3">
            {secondaryAction}
            {primaryAction}
          </div>
        </div>
      ) : null}
    </div>
  )
}
