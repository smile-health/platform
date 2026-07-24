import React from 'react'

const DistributionDisposalDetailVerticalIdentity = ({
  title,
  value,
}: {
  title: string
  value: string | number | undefined | null
}) => {
  return (
    <div className="ui-flex ui-flex-col ui-my-4">
      <h2 className="ui-text-sm ui-text-neutral-500">{title}</h2>
      <h3 className="ui-text-base ui-text-primary-800 ui-font-bold">{value}</h3>
    </div>
  )
}

export default DistributionDisposalDetailVerticalIdentity
