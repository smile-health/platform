import { ReactNode } from 'react'

type AnnualCommitmentDetailBoxProps = {
  title?: string
  children: ReactNode
  action?: ReactNode
  className?: string
}

export const AnnualCommitmentDetailBox = ({
  title,
  children,
  action,
  className,
}: AnnualCommitmentDetailBoxProps) => {
  return (
    <div className="ui-border ui-border-gray-300 ui-rounded">
      <div className="ui-p-6">
        {(title || action) && (
          <div className="ui-flex ui-justify-between ui-items-center ui-mb-4">
            {title && (
              <div className="ui-font-bold ui-text-dark-blue">{title}</div>
            )}
            {action && <div>{action}</div>}
          </div>
        )}
        <div className={className}>{children}</div>
      </div>
    </div>
  )
}
